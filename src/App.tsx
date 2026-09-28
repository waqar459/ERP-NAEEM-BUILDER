/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Header } from './components/common/Header';
import { AuditTrailModal } from './components/common/AuditTrailModal';
import { System1Dashboard } from './components/here4u/System1Dashboard';
import { TicketDetailModal } from './components/here4u/TicketDetailModal';
import { NewTicketModal } from './components/here4u/NewTicketModal';
import { System2Dashboard } from './components/projects/System2Dashboard';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { NewProjectModal } from './components/projects/NewProjectModal';
import { ExpenseFuelManager } from './components/expenses/ExpenseFuelManager';
import { BranchMasterView } from './components/branches/BranchMasterView';
import { AIHubModal } from './components/ai/AIHubModal';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { VendorCostReport } from './components/analytics/VendorCostReport';
import { ConsolidatedInvoicesView } from './components/here4u/ConsolidatedInvoicesView';
import { AdminPanelView } from './components/admin/AdminPanelView';
import { SimpleERPLayout } from './components/here4u/SimpleERPLayout';
import { ERPTutorialGuideModal } from './components/common/ERPTutorialGuideModal';

function ERPAppContent() {
  const { systemMode, setSystemMode } = useERP();

  // Primary View Mode: defaults to SIMPLE
  const [viewMode, setViewMode] = useState<'SIMPLE' | 'ADVANCED'>('SIMPLE');

  // Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAiHubOpen, setIsAiHubOpen] = useState(false);
  const [isTutorialGuideOpen, setIsTutorialGuideOpen] = useState(false);

  // Ticket Modals
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketInitialMode, setNewTicketInitialMode] = useState<'AI_EMAIL' | 'MANUAL' | 'BRANCH_FIRST_ESTIMATE'>('AI_EMAIL');

  // Project Modals
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // When viewMode is SIMPLE, render the exact layout requested by user
  if (viewMode === 'SIMPLE') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <SimpleERPLayout
          onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
          onOpenNewTicket={() => {
            setNewTicketInitialMode('AI_EMAIL');
            setIsNewTicketModalOpen(true);
          }}
          onOpenAuditTrail={() => setIsAuditModalOpen(true)}
          onOpenAI={() => setIsAiHubOpen(true)}
          onOpenTutorialGuide={() => setIsTutorialGuideOpen(true)}
        />

        {/* View Mode Switcher Floating Pill (bottom right) */}
        <div className="fixed bottom-4 right-4 z-30 no-print flex items-center gap-2">
          <button
            onClick={() => setIsTutorialGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
          >
            <span>📖 Implementation Guide (PDF)</span>
          </button>
          <button
            onClick={() => setViewMode('ADVANCED')}
            className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold shadow-lg transition-all cursor-pointer border border-slate-700"
          >
            Switch to Blueprint View
          </button>
        </div>

        {/* All Modals */}
        {selectedTicketId && (
          <TicketDetailModal
            ticketId={selectedTicketId}
            onClose={() => setSelectedTicketId(null)}
          />
        )}

        {isNewTicketModalOpen && (
          <NewTicketModal
            isOpen={isNewTicketModalOpen}
            onClose={() => setIsNewTicketModalOpen(false)}
            onTicketCreated={(ticketId) => setSelectedTicketId(ticketId)}
            initialMode={newTicketInitialMode}
          />
        )}

        <AuditTrailModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
        />

        <AIHubModal
          isOpen={isAiHubOpen}
          onClose={() => setIsAiHubOpen(false)}
          onSelectTicket={(id) => {
            setIsAiHubOpen(false);
            setSelectedTicketId(id);
          }}
          onSelectProject={(id) => {
            setIsAiHubOpen(false);
            setSelectedProjectId(id);
          }}
        />

        <ERPTutorialGuideModal
          isOpen={isTutorialGuideOpen}
          onClose={() => setIsTutorialGuideOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        onOpenNewTicket={() => {
          setNewTicketInitialMode('AI_EMAIL');
          setIsNewTicketModalOpen(true);
        }}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        onOpenAuditTrail={() => setIsAuditModalOpen(true)}
        onOpenAI={() => setIsAiHubOpen(true)}
      />

      {/* Floating Pill to switch to Simple View */}
      <div className="fixed bottom-4 right-4 z-30 no-print flex items-center gap-2">
        <button
          onClick={() => setIsTutorialGuideOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
        >
          <span>📖 Guide (PDF)</span>
        </button>
        <button
          onClick={() => setViewMode('SIMPLE')}
          className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold shadow-lg transition-all cursor-pointer border border-slate-700"
        >
          Switch to Simple View
        </button>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {systemMode === 'SYSTEM_1_HERE4U' && (
          <System1Dashboard
            onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
            onOpenNewTicket={() => {
              setNewTicketInitialMode('AI_EMAIL');
              setIsNewTicketModalOpen(true);
            }}
            onOpenBranchEstimate={() => {
              setNewTicketInitialMode('BRANCH_FIRST_ESTIMATE');
              setIsNewTicketModalOpen(true);
            }}
          />
        )}

        {systemMode === 'SYSTEM_2_BRANCH_REGION' && (
          <System2Dashboard
            onSelectProject={(projectId) => setSelectedProjectId(projectId)}
            onOpenNewProject={() => setIsNewProjectModalOpen(true)}
          />
        )}

        {systemMode === 'ANALYTICS_GRAPHS' && (
          <AnalyticsDashboard
            onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
            onSelectProject={(projectId) => setSelectedProjectId(projectId)}
          />
        )}

        {systemMode === 'BRANCH_MASTER' && (
          <BranchMasterView onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)} />
        )}

        {(systemMode === 'FIELD_EXPENSES' || systemMode === 'COST_CONTROL') && (
          <ExpenseFuelManager />
        )}

        {systemMode === 'VENDOR_COST_REPORT' && (
          <VendorCostReport
            onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
            onSelectProject={(projectId) => setSelectedProjectId(projectId)}
          />
        )}

        {systemMode === 'CONSOLIDATED_INVOICES' && (
          <ConsolidatedInvoicesView
            onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
          />
        )}

        {systemMode === 'ADMIN_PANEL' && (
          <AdminPanelView />
        )}

        {systemMode === 'AI_INTELLIGENCE' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 p-6 rounded-2xl border border-purple-500/30">
              <h2 className="text-xl font-bold text-white mb-2">AI Operations & Executive Intelligence Center</h2>
              <p className="text-xs text-slate-300 max-w-2xl mb-4">
                Section 21: Cross-system natural language management queries, audit detection, and proactive cost control alerts across tickets, BOQs, RA bills, and fuel records.
              </p>
              <button
                onClick={() => setIsAiHubOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                Launch Management Query Assistant
              </button>
            </div>
            <ExpenseFuelManager />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 p-4 text-center text-xs text-slate-500">
        Naeem Builder ERP — Dual Operations Architecture: System 1 (HERE4U Maintenance) & System 2 (Branch + Region Build-Up Projects). Built with GPS Proximity Auditing & Gemini Operations Assistant.
      </footer>

      {/* Modals */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
        />
      )}

      {isNewTicketModalOpen && (
        <NewTicketModal
          isOpen={isNewTicketModalOpen}
          onClose={() => setIsNewTicketModalOpen(false)}
          onTicketCreated={(ticketId) => setSelectedTicketId(ticketId)}
          initialMode={newTicketInitialMode}
        />
      )}

      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
        />
      )}

      {isNewProjectModalOpen && (
        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onProjectCreated={(projId) => setSelectedProjectId(projId)}
        />
      )}

      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <AIHubModal
        isOpen={isAiHubOpen}
        onClose={() => setIsAiHubOpen(false)}
        onSelectTicket={(id) => {
          setIsAiHubOpen(false);
          setSelectedTicketId(id);
        }}
        onSelectProject={(id) => {
          setIsAiHubOpen(false);
          setSelectedProjectId(id);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ERPProvider>
      <ERPAppContent />
    </ERPProvider>
  );
}
