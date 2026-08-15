import React, { useState } from 'react';
import { ProfileCompleteness } from '../types';

interface ProfileCompletenessChecklistProps {
  completeness: ProfileCompleteness;
}

const ProfileCompletenessChecklist: React.FC<ProfileCompletenessChecklistProps> = ({ completeness }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 sm:p-6 shadow-md border border-gray-200 dark:border-gray-800 transition-all">
      {/* Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
              completeness.isComplete
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {completeness.isComplete ? 'verified' : 'pending_actions'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Checklist de Completude do Perfil
              </h3>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  completeness.isComplete
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                }`}
              >
                {completeness.isComplete ? 'Perfil Completo' : 'Perfil Incompleto'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {completeness.isComplete
                ? 'Seu perfil atende aos requisitos estruturais essenciais.'
                : 'Seu perfil ainda precisa de algumas informações obrigatórias para ficar completo.'}
            </p>
          </div>
        </div>

        {/* Toggle & Score Badge */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {completeness.score}% preenchido
            </span>
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  completeness.isComplete ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${completeness.score}%` }}
              ></div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
            aria-label={expanded ? 'Recolher checklist' : 'Expandir checklist'}
          >
            <span className="material-symbols-outlined">
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Checklist Details */}
      {expanded && (
        <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {completeness.items.map((item) => {
            const isDone = item.status === 'complete';
            const isPendingMandatory = item.isRequired && !isDone;

            return (
              <div
                key={item.key}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                  isDone
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                    : isPendingMandatory
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                    : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-lg mt-0.5 ${
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isPendingMandatory
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-400'
                  }`}
                >
                  {isDone ? 'check_circle' : isPendingMandatory ? 'cancel' : 'info'}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        item.isRequired
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.isRequired ? 'Obrigatório' : 'Opcional'}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold block mt-0.5 ${
                      isDone
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : isPendingMandatory
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {isDone ? '✓ Cadastrado' : isPendingMandatory ? '✗ Pendente' : 'Não preenchido (Opcional)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileCompletenessChecklist;
