import { useState } from 'react';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';
import {
  formatAmount,
  formatDate,
  formatEnum,
  getAmountColor,
  getAmountSymbol
} from '../shared/format';
import type { Transactions } from '../shared/types';
import { Link } from '@tanstack/react-router';
import { TransactionImageViewer } from './TransactionImageViewer';

type Props = {
  transactions: Transactions[];
  type: 'customers' | 'stores' | 'staffs';
};

export const TransactionList = ({ transactions, type }: Props) => {
  const [expandedId, setExpandedId] = useState<string>('');

  const toggleExpand = (id: string) => {
    setExpandedId((prev: string) => (prev === id ? '' : id));
  };

  const getEditTransactionPageLink = (transaction: Transactions) => {
    switch (type) {
      case 'staffs':
        return {
          to: '/staffs/$staffId/transactions/$txId/edit',
          params: { staffId: transaction.accountId, txId: transaction._id }
        };
      case 'customers':
        return {
          to: '/customers/$customerId/transactions/$txId/edit',
          params: { customerId: transaction.accountId, txId: transaction._id }
        };
      case 'stores':
        return {
          to: '/stores/$storeId/transactions/$txId/edit',
          params: { storeId: transaction.accountId, txId: transaction._id }
        };
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {transactions.map((transaction) => {
        const isExpanded = expandedId === transaction._id;

        return (
          <div
            key={transaction._id}
            className={`p-4 transition ${isExpanded ? 'bg-gray-50' : ''}`}
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(transaction._id)}
            >
              {/* Left */}
              <div className="flex flex-col flex-1 gap-1 min-w-0 pr-3">
                <div className="font-medium text-gray-800 truncate">
                  {formatDate(transaction.date)}
                </div>

                <div
                  className={`text-sm text-gray-500 ${
                    isExpanded ? 'whitespace-normal' : 'truncate max-w-60'
                  }`}
                >
                  {transaction.note}
                </div>
              </div>

              {/* Right */}
              <div className="text-right shrink-0 ml-2">
                <div
                  className={`font-semibold text-base ${getAmountColor(
                    transaction.transactionType
                  )}`}
                >
                  {getAmountSymbol(transaction.amountChange)}
                  {formatAmount(transaction.amount)}
                </div>

                <div className="text-sm text-gray-500 capitalize">
                  {formatEnum(transaction.transactionType)}
                </div>
              </div>
            </div>

            <TransactionImageViewer transaction={transaction} />

            {/* Actions */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded
                  ? 'max-h-40 opacity-100 translate-y-0'
                  : 'max-h-0 opacity-0 -translate-y-1'
              }`}
            >
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end gap-3">
                  <Link
                    {...getEditTransactionPageLink(transaction)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-600 active:bg-blue-100"
                  >
                    <FiEdit3 size={14} />
                    Edit
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Delete', transaction._id);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 active:bg-red-100"
                  >
                    <FiTrash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
