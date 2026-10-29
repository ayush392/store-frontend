import { useId, useState } from 'react';
import { FiChevronDown, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { Link } from '@tanstack/react-router';
import {
  formatAmount,
  formatDate,
  formatEnum,
  getAmountColor,
  getAmountSymbol
} from '../shared/format';
import { editTransactionLink } from '../shared/accountLinks';
import type { AccountType } from '../shared/schemas/account.schema';
import type { Transactions } from '../shared/types';
import { buttonClass } from './buttonClass';
import { Button } from './Button';
import { TransactionImageViewer } from './TransactionImageViewer';

type Props = {
  transactions: Transactions[];
  accountType: AccountType;
};

export const TransactionList = ({ transactions, accountType }: Props) => {
  const [expandedId, setExpandedId] = useState<string>('');

  const toggleExpand = (id: string) => {
    setExpandedId((prev: string) => (prev === id ? '' : id));
  };

  return (
    <ul className="divide-y divide-line">
      {transactions.map((transaction) => (
        <TransactionRow
          key={transaction._id}
          transaction={transaction}
          accountType={accountType}
          isExpanded={expandedId === transaction._id}
          onToggle={() => toggleExpand(transaction._id)}
          onDelete={() => {
            console.log('Delete', transaction._id);
          }}
        />
      ))}
    </ul>
  );
};

type RowProps = {
  transaction: Transactions;
  accountType: AccountType;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

const TransactionRow = ({
  transaction,
  accountType,
  isExpanded,
  onToggle,
  onDelete
}: RowProps) => {
  const actionsId = useId();
  const type = formatEnum(transaction.transactionType);

  return (
    <li className={isExpanded ? 'bg-surface-muted' : ''}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={actionsId}
        className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface-muted"
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium text-fg">{formatDate(transaction.date)}</p>
          {transaction.note && (
            <p
              className={`text-sm text-fg-secondary ${
                isExpanded ? 'whitespace-normal break-words' : 'truncate'
              }`}
            >
              {transaction.note}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`font-semibold tabular-nums ${getAmountColor(
              transaction.transactionType
            )}`}
          >
            {getAmountSymbol(transaction.amountChange)}
            {formatAmount(transaction.amount)}
          </p>
          <p className="text-sm text-fg-secondary">{type}</p>
        </div>

        <FiChevronDown
          size={18}
          aria-hidden="true"
          className={`shrink-0 text-fg-muted transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Bill thumbnails are buttons, so they sit outside the row button. */}
      {transaction.images?.length ? (
        <div className="px-4 pb-3 -mt-1">
          <TransactionImageViewer transaction={transaction} />
        </div>
      ) : null}

      <div id={actionsId} hidden={!isExpanded}>
        {isExpanded && (
          <div className="flex justify-end gap-3 px-4 pb-3">
            <Link
              {...editTransactionLink(
                accountType,
                transaction.accountId,
                transaction._id
              )}
              className={buttonClass({ variant: 'ghost', className: 'px-3' })}
            >
              <FiEdit3 size={16} aria-hidden="true" />
              Edit
            </Link>
            <Button
              variant="destructive"
              className="px-3"
              onClick={onDelete}
            >
              <FiTrash2 size={16} aria-hidden="true" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </li>
  );
};
