import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { queryKeys, transactionAffectedKeys } from '../shared/queryKeys';
import { fetcher } from '../lib/fetcher';
import { notifyError, notifySuccess } from '../lib/toast';
import { buttonClass } from './buttonClass';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { TransactionImageViewer } from './TransactionImageViewer';

type Props = {
  transactions: Transactions[];
  accountType: AccountType;
};

export const TransactionList = ({ transactions, accountType }: Props) => {
  const [expandedId, setExpandedId] = useState<string>('');
  const [toDelete, setToDelete] = useState<Transactions | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev: string) => (prev === id ? '' : id));
  };

  return (
    <>
      <ul className="divide-y divide-line">
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction._id}
            transaction={transaction}
            accountType={accountType}
            isExpanded={expandedId === transaction._id}
            onToggle={() => toggleExpand(transaction._id)}
            onDelete={() => setToDelete(transaction)}
          />
        ))}
      </ul>

      {toDelete && (
        <DeleteTransactionSheet
          transaction={toDelete}
          accountType={accountType}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
};

type DeleteProps = {
  transaction: Transactions;
  accountType: AccountType;
  onClose: () => void;
};

// Confirmation before DELETE /transaction/:id. The backend soft-deletes the
// transaction, records it in the edit history and reverses its effect on the
// balance. On error the sheet stays open so the user can retry or cancel.
const DeleteTransactionSheet = ({
  transaction,
  accountType,
  onClose
}: DeleteProps) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => fetcher(`/transaction/${transaction._id}`, 'DELETE'),
    onSuccess: () => {
      for (const queryKey of transactionAffectedKeys(
        accountType,
        transaction.accountId
      )) {
        queryClient.invalidateQueries({ queryKey });
      }
      // Never reuse the cached copy of a deleted transaction (the backend's
      // basic endpoint still returns deleted transactions).
      queryClient.removeQueries({
        queryKey: queryKeys.transactionBasic(transaction._id)
      });
      notifySuccess('Transaction deleted');
      onClose();
    },
    onError: (error) => {
      notifyError(error.message);
    }
  });

  return (
    <BottomSheet
      title="Delete transaction?"
      onClose={onClose}
      dismissible={!isPending}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-surface-muted px-4 py-3">
          <p className="text-sm text-fg-secondary">
            {formatEnum(transaction.transactionType)} ·{' '}
            {formatDate(transaction.date)}
          </p>
          <p
            className={`text-xl font-semibold tabular-nums ${getAmountColor(
              transaction.transactionType
            )}`}
          >
            {getAmountSymbol(transaction.amountChange)}
            {formatAmount(transaction.amount)}
          </p>
          {transaction.note && (
            <p className="mt-1 break-words text-sm text-fg-secondary">
              {transaction.note}
            </p>
          )}
        </div>

        <p className="text-base text-fg">
          The account balance will be adjusted. This can't be undone in the
          app.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutate()}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </BottomSheet>
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
