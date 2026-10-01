import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AgendaProvider, useAgenda } from './context/AgendaContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CalendarView } from './components/calendar/CalendarView';
import { TasksView } from './components/tasks/TasksView';
import { ContactsView } from './components/contacts/ContactsView';
import { NotesView } from './components/notes/NotesView';

// Modals & Floating Components
import { EventModal } from './components/modals/EventModal';
import { TaskModal } from './components/modals/TaskModal';
import { ContactModal } from './components/modals/ContactModal';
import { NoteModal } from './components/modals/NoteModal';
import { BackupModal } from './components/modals/BackupModal';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { ToastContainer } from './components/common/Toast';

import './App.css';

const MainAppContent: React.FC = () => {
  const { activeView, activeModal } = useAgenda();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'calendar':
        return <CalendarView />;
      case 'tasks':
        return <TasksView />;
      case 'contacts':
        return <ContactsView />;
      case 'notes':
        return <NotesView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Container: Sidebar + Content */}
      <main className="app-main-layout">
        <Sidebar
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        <section className="app-content-area">
          {renderActiveView()}
        </section>
      </main>

      {/* Interactive Modals */}
      {activeModal === 'event' && <EventModal />}
      {activeModal === 'task' && <TaskModal />}
      {activeModal === 'contact' && <ContactModal />}
      {activeModal === 'note' && <NoteModal />}
      {activeModal === 'backup' && <BackupModal />}
      {activeModal === 'quick-add' && <QuickAddModal />}

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <AgendaProvider>
          <MainAppContent />
        </AgendaProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
