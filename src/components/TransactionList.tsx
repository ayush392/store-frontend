import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { FiChevronDown, FiEdit3, FiTrash2 } from 'react-icons/fi';
import {
  formatAmount,
  formatDate,
  formatEnum,
  getAmountColor,
  getAmountSymbol
} from '../shared/format';
import type { Transactions } from '../shared/types';
import { haptics } from '../shared/utils/haptics';
import { TransactionImageViewer } from './TransactionImageViewer';

type Props = {
  transactions: Transactions[];
  type: 'customers' | 'stores' | 'staffs';
};

/** Tap a row to reveal its actions (Edit / Delete). */
const getEditLink = (type: Props['type'], tx: Transactions) => {
  switch (type) {
    case 'staffs':
      return {
        to: '/staffs/$staffId/transactions/$txId/edit',
        params: { staffId: tx.accountId, txId: tx._id }
      } as const;
    case 'customers':
      return {
        to: '/customers/$customerId/transactions/$txId/edit',
        params: { customerId: tx.accountId, txId: tx._id }
      } as const;
    case 'stores':
      return {
        to: '/stores/$storeId/transactions/$txId/edit',
        params: { storeId: tx.accountId, txId: tx._id }
      } as const;
  }
};

export const TransactionList = ({ transactions, type }: Props) => {
  const [expandedId, setExpandedId] = useState<string>('');

  const toggleExpand = (id: string) => {
    haptics.selection();
    setExpandedId((prev) => (prev === id ? '' : id));
  };

  return (
    <div className="list-divider">
      {transactions.map((transaction) => {
        const isExpanded = expandedId === transaction._id;

        return (
          <div
            key={transaction._id}
            className={`transition-colors duration-150 ${isExpanded ? 'bg-slate-50' : ''}`}
          >
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => toggleExpand(transaction._id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-100"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold tracking-tight text-slate-900">
                  {formatDate(transaction.date)}
                </div>
                <div
                  className={`mt-0.5 text-xs text-slate-500 ${
                    isExpanded ? 'break-words whitespace-normal' : 'truncate'
                  }`}
                >
                  {transaction.note || 'No notes added'}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div
                  className={`text-sm font-bold tracking-tight tabular-nums ${getAmountColor(
                    transaction.transactionType
                  )}`}
                >
                  {getAmountSymbol(transaction.amountChange)}
                  {formatAmount(transaction.amount)}
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-slate-400">
                  {formatEnum(transaction.transactionType)}
                </div>
              </div>

              <FiChevronDown
                size={16}
                aria-hidden="true"
                className={`shrink-0 text-slate-300 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {(transaction.images?.length ?? 0) > 0 && (
              <div className="-mt-1 px-4 pb-3">
                <TransactionImageViewer transaction={transaction} />
              </div>
            )}

            {/* Expandable action bar */}
            <div
              className={`grid transition-all duration-200 ease-out ${
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid grid-cols-2 gap-2 px-4 pb-3.5">
                  <Link
                    {...getEditLink(type, transaction)}
                    onClick={() => haptics.selection()}
                    tabIndex={isExpanded ? 0 : -1}
                    className="btn btn-md btn-tinted"
                  >
                    <FiEdit3 size={15} />
                    Edit
                  </Link>

                  <button
                    onClick={() => {
                      haptics.heavy();
                      console.log('Delete', transaction._id);
                    }}
                    type="button"
                    tabIndex={isExpanded ? 0 : -1}
                    className="btn btn-md btn-tinted-danger"
                  >
                    <FiTrash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
