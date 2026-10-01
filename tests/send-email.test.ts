import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Mockeamos el SDK de AWS: el test nunca debe hacer una llamada real a SES.
// sendMock queda accesible para las assertions y para simular fallos.
const sendMock = vi.fn()
vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: vi.fn().mockImplementation(function SESClientMock() {
    return { send: sendMock }
  }),
  SendEmailCommand: vi.fn().mockImplementation(function SendEmailCommandMock(input: unknown) {
    return input
  }),
}))

// SES_FROM_EMAIL se lee dentro del handler en cada request (no al importar
// el módulo), así que un único import estático alcanza para todos los tests.
const { default: handler } = await import('../api/send-email')

// El handler solo lee req.method/req.body y llama res.status/json/setHeader.
// Un mock parcial tipado es suficiente para ejercitar ese contrato: montar un
// IncomingMessage/ServerResponse completo no aportaría nada a estos tests.
function makeReq(overrides: Partial<VercelRequest>): VercelRequest {
  return { method: 'POST', body: {}, ...overrides } as VercelRequest
}

function makeRes() {
  const res = {
    statusCode: 200,
    setHeader: vi.fn(),
    status: vi.fn(function (this: typeof res, code: number) {
      this.statusCode = code
      return this
    }),
    json: vi.fn(function (this: typeof res) {
      return this
    }),
  }
  return res as unknown as VercelResponse & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
    setHeader: ReturnType<typeof vi.fn>
  }
}

describe('POST /api/send-email', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...ORIGINAL_ENV, SES_FROM_EMAIL: 'no-reply@matecode.test' }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('rechaza métodos distintos de POST con 405', async () => {
    const req = makeReq({ method: 'GET' })
    const res = makeRes()

    await handler(req, res)

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST')
    expect(res.status).toHaveBeenCalledWith(405)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('rechaza si falta un email de destino válido (caso borde)', async () => {
    const req = makeReq({ body: { to: 'no-es-un-email', tasks: [] } })
    const res = makeRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Falta un email de destino válido.' })
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('rechaza si "tasks" no es un array', async () => {
    const req = makeReq({ body: { to: 'user@example.com', tasks: 'no-array' } })
    const res = makeRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'El campo "tasks" debe ser un array.' })
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('devuelve 503 si el servicio de email no está configurado', async () => {
    delete process.env.SES_FROM_EMAIL
    const req = makeReq({ body: { to: 'user@example.com', tasks: [] } })
    const res = makeRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(503)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('envía el email y responde 200 cuando el payload es válido', async () => {
    sendMock.mockResolvedValue({ MessageId: 'abc123' })
    const req = makeReq({
      body: {
        to: 'user@example.com',
        name: 'Analía',
        theme: 'classic',
        period: { startDate: '2026-09-30', endDate: '2026-10-01' },
        tasks: [{ title: 'Comprar vino', completed: false, priority: 'high' }],
        events: [{
          title: 'Reunión de proyecto',
          date: '2026-09-30',
          startTime: '09:30',
          endTime: '10:30',
          location: 'Sala principal',
        }],
      },
    })
    const res = makeRes()

    await handler(req, res)

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })

    const email = sendMock.mock.calls[0][0] as {
      Source: string
      Message: {
        Subject: { Data: string }
        Body: { Html: { Data: string }; Text: { Data: string } }
      }
    }
    expect(email.Source).toBe('Aura Agenda <no-reply@matecode.test>')
    expect(email.Message.Subject.Data).toContain('Aura Agenda')
    expect(email.Message.Body.Html.Data).toContain('Comprar vino')
    expect(email.Message.Body.Html.Data).toContain('Reunión de proyecto')
    expect(email.Message.Body.Html.Data).toContain('30/09/2026 al 01/10/2026')
    expect(email.Message.Body.Html.Data).not.toContain('Mate Code')
    expect(email.Message.Body.Text.Data).toContain('Reunión de proyecto')
  })

  it('responde 502 cuando SES falla (caso borde: error del serverless)', async () => {
    sendMock.mockRejectedValue(new Error('SES caído'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const req = makeReq({ body: { to: 'user@example.com', tasks: [] } })
    const res = makeRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(502)
    expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo enviar el email.' })
  })
})
