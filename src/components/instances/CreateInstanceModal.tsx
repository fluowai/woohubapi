import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Cpu,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Check,
  AlertTriangle
} from 'lucide-react';
import { EngineType } from '../../types';

interface CreateInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, engine: EngineType) => Promise<any>;
}

export const CreateInstanceModal: React.FC<CreateInstanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<EngineType>('wuzapi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor informe um nome para a instância.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(name.trim(), selectedEngine);
      // reset
      setName('');
      setSelectedEngine('wuzapi');
      setStep(1);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar instância');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Etapa {step} de 2
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {step === 1 ? 'Criar Nova Instância WhatsApp' : 'Selecionar Motor de Conexão'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nome da Instância <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Comercial, Suporte, Financeiro..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Identificador visual para sua equipe e integração via API.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Arquitetura Unificada WooHub
                </div>
                <p>
                  Independente do motor que você selecionar na próxima etapa, toda a comunicação
                  ocorrerá de forma 100% padronizada através da WooHub API.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Avançar para Motores</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Selecione o modelo de motor para esta conexão. Cada motor possui características
                técnicas verificadas:
              </p>

              {/* 3 Engine Cards */}
              <div className="grid grid-cols-1 gap-3">
                {/* WAHA Card */}
                <div
                  onClick={() => setSelectedEngine('waha')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedEngine === 'waha'
                      ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">WAHA</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Node.js / Chromium / PLUS
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Modelo baseado em WAHA. Suporte nativo completo a botões interativos, listas,
                        áudio, vídeo e documentos.
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedEngine === 'waha'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedEngine === 'waha' && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
                    <span>Botões: Sim</span>
                    <span>•</span>
                    <span>Mídia: Total</span>
                    <span>•</span>
                    <span>Memória: ~180MB</span>
                  </div>
                </div>

                {/* WuzAPI Card */}
                <div
                  onClick={() => setSelectedEngine('wuzapi')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedEngine === 'wuzapi'
                      ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">WuzAPI</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Golang / SQLite REST
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Modelo baseado em WuzAPI. Serviço REST em Go ultrarrápido, excelente para
                        transmissão de alto volume e baixo consumo.
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedEngine === 'wuzapi'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedEngine === 'wuzapi' && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
                    <span>Botões: Não</span>
                    <span>•</span>
                    <span>Mídia: Essencial</span>
                    <span>•</span>
                    <span>Memória: ~45MB</span>
                  </div>
                </div>

                {/* whatsmeow Card */}
                <div
                  onClick={() => setSelectedEngine('whatsmeow')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedEngine === 'whatsmeow'
                      ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">whatsmeow</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                          Pure Go Protocol
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Modelo baseado em whatsmeow puro. Conexão direta por socket binário multi-device,
                        sem browser, latência mínima.
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedEngine === 'whatsmeow'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedEngine === 'whatsmeow' && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
                    <span>Botões: Não</span>
                    <span>•</span>
                    <span>Mídia: Essencial</span>
                    <span>•</span>
                    <span>Memória: ~30MB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinish}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Criando Instância...</span>
                  ) : (
                    <>
                      <span>Criar Instância</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
