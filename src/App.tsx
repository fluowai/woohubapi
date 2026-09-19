import React, { useState } from 'react';
import { useWooHubStore } from './store/useWooHubStore';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// Views
import { OverviewView } from './components/dashboard/OverviewView';
import { InstancesView } from './components/instances/InstancesView';
import { MessagesView } from './components/messages/MessagesView';
import { WebhooksView } from './components/webhooks/WebhooksView';
import { DevelopersView } from './components/developers/DevelopersView';
import { LogsView } from './components/logs/LogsView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { CreateInstanceModal } from './components/instances/CreateInstanceModal';
import { QRCodeModal } from './components/instances/QRCodeModal';
import { InstanceDetailModal } from './components/instances/InstanceDetailModal';
import { SendMessageModal } from './components/messages/SendMessageModal';
import { SimulateInboundModal } from './components/messages/SimulateInboundModal';
import { DockerGuideModal } from './components/common/DockerGuideModal';
import { Instance } from './types';

export default function App() {
  const {
    currentOrg,
    setCurrentOrg,
    organizations,
    instances,
    messages,
    apiKeys,
    webhooks,
    deliveries,
    logs,
    servers,
    engines,
    createInstance,
    connectInstance,
    simulateScanQRCode,
    disconnectInstance,
    restartInstance,
    logoutInstance,
    deleteInstance,
    sendMessage,
    simulateReceiveMessage,
    createApiKey,
    revokeApiKey,
    createWebhook,
    toggleWebhook,
    deleteWebhook,
    retryWebhookDelivery,
    testPingWebhook,
    clearLogs
  } = useWooHubStore();

  // Navigation & Shell State
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [isSimulateInboundOpen, setIsSimulateInboundOpen] = useState(false);
  const [isDockerGuideOpen, setIsDockerGuideOpen] = useState(false);
  const [qrModalInstance, setQrModalInstance] = useState<Instance | null>(null);
  const [detailModalInstance, setDetailModalInstance] = useState<Instance | null>(null);

  // Navigation router helper
  const handleNavigate = (tab: NavigationTab) => {
    if (tab === 'docker-guide') {
      setIsDockerGuideOpen(true);
      return;
    }
    if (tab === 'api-keys') {
      setActiveTab('settings');
      return;
    }
    setActiveTab(tab);
  };

  // QR modal helper
  const handleOpenQR = async (inst: Instance) => {
    let freshInst = inst;
    try {
      if (inst.status !== 'WAITING_QR' && inst.status !== 'CONNECTED') {
        const res = await connectInstance(inst.id);
        if (res?.qrCode) {
          freshInst = {
            ...inst,
            status: res.status,
            qrCode: res.qrCode,
            statusMessage: 'Aguardando leitura do QR Code...'
          };
        }
      }
    } catch (err) {
      console.warn('Erro ao conectar instância para QR Code:', err);
    }
    const updated = instances.find((i) => i.id === freshInst.id) || freshInst;
    setQrModalInstance(updated);
  };

  const handleOpenDetail = (inst: Instance) => {
    setDetailModalInstance(inst);
  };

  const activeQrInstance = qrModalInstance
    ? instances.find((i) => i.id === qrModalInstance.id) || qrModalInstance
    : null;

  const activeDetailInstance = detailModalInstance
    ? instances.find((i) => i.id === detailModalInstance.id) || detailModalInstance
    : null;

  return (
    <div className="flex h-screen bg-slate-100/70 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={handleNavigate}
        organization={currentOrg}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar */}
        <TopBar
          currentOrg={currentOrg}
          organizations={organizations}
          onSelectOrg={setCurrentOrg}
          onOpenCreateInstance={() => setIsCreateModalOpen(true)}
          onOpenSendMessage={() => setIsSendMessageModalOpen(true)}
          onOpenDockerGuide={() => setIsDockerGuideOpen(true)}
          onOpenMobileMenu={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          unacknowledgedLogsCount={logs.filter((l) => l.level === 'warn' || l.level === 'error').length}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'overview' && (
              <OverviewView
                instances={instances}
                messages={messages}
                logs={logs}
                onOpenCreateInstance={() => setIsCreateModalOpen(true)}
                onOpenSendMessage={() => setIsSendMessageModalOpen(true)}
                onOpenQR={handleOpenQR}
                onViewInstanceDetail={handleOpenDetail}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'instances' && (
              <InstancesView
                instances={instances}
                onOpenCreateInstance={() => setIsCreateModalOpen(true)}
                onOpenQR={handleOpenQR}
                onViewDetail={handleOpenDetail}
                onDisconnect={disconnectInstance}
                onOpenSendMessage={() => setIsSendMessageModalOpen(true)}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesView
                messages={messages}
                instances={instances}
                onOpenSendMessage={() => setIsSendMessageModalOpen(true)}
                onOpenSimulateInbound={() => setIsSimulateInboundOpen(true)}
              />
            )}

            {activeTab === 'webhooks' && (
              <WebhooksView
                webhooks={webhooks}
                deliveries={deliveries}
                onCreateWebhook={createWebhook}
                onToggleWebhook={toggleWebhook}
                onDeleteWebhook={deleteWebhook}
                onRetryDelivery={retryWebhookDelivery}
                onTestPing={testPingWebhook}
              />
            )}

            {activeTab === 'developers' && (
              <DevelopersView instances={instances} />
            )}

            {activeTab === 'logs' && (
              <LogsView logs={logs} onClearLogs={clearLogs} />
            )}

            {(activeTab === 'settings' || activeTab === 'team' || activeTab === 'billing') && (
              <SettingsView
                currentOrg={currentOrg}
                apiKeys={apiKeys}
                onCreateApiKey={createApiKey}
                onRevokeApiKey={revokeApiKey}
              />
            )}

            {/* Admin specific views fallback to Overview/Settings */}
            {(activeTab === 'admin-clients' || activeTab === 'admin-engines' || activeTab === 'admin-servers') && (
              <SettingsView
                currentOrg={currentOrg}
                apiKeys={apiKeys}
                onCreateApiKey={createApiKey}
                onRevokeApiKey={revokeApiKey}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateInstanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (name, engine) => {
          const newInst = await createInstance(name, engine);
          await handleOpenQR(newInst);
          return newInst;
        }}
      />

      <QRCodeModal
        isOpen={!!qrModalInstance}
        onClose={() => setQrModalInstance(null)}
        instance={activeQrInstance}
        onRefreshQR={async (id) => {
          try {
            await connectInstance(id);
          } catch (err) {
            console.warn('Erro ao atualizar QR Code:', err);
          }
        }}
        onSimulateScan={simulateScanQRCode}
      />

      <InstanceDetailModal
        isOpen={!!detailModalInstance}
        onClose={() => setDetailModalInstance(null)}
        instance={activeDetailInstance}
        messages={messages}
        logs={logs}
        webhooks={webhooks}
        onConnect={connectInstance}
        onDisconnect={disconnectInstance}
        onRestart={restartInstance}
        onLogout={logoutInstance}
        onDelete={deleteInstance}
        onOpenQR={handleOpenQR}
        onSendMessage={() => {
          setDetailModalInstance(null);
          setIsSendMessageModalOpen(true);
        }}
      />

      <SendMessageModal
        isOpen={isSendMessageModalOpen}
        onClose={() => setIsSendMessageModalOpen(false)}
        instances={instances}
        onSendMessage={sendMessage}
      />

      <SimulateInboundModal
        isOpen={isSimulateInboundOpen}
        onClose={() => setIsSimulateInboundOpen(false)}
        instances={instances}
        onSimulateReceive={simulateReceiveMessage}
      />

      <DockerGuideModal
        isOpen={isDockerGuideOpen}
        onClose={() => setIsDockerGuideOpen(false)}
      />
    </div>
  );
}
