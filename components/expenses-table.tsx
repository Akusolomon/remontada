'use client';

import { useState } from 'react';
import { Expense, useData } from '@/lib/data-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExpenseModal } from './expense-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast'; // Import toast if available

interface ExpensesTableProps {
  expenses: Expense[];
  dateRange: { from: Date; to: Date };
  onRefresh?: () => void; 
}

export function ExpensesTable({ expenses, dateRange, onRefresh }: ExpensesTableProps) {
  const { deleteExpense } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [deleteId, setDeleteId] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredExpenses = expenses;

  const handleEdit = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error("No ID provided for deletion");
      toast({
        title: "Error",
        description: "No expense ID provided",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      // Delete from the actual backend API
      // Adjust the endpoint based on your actual backend route
      const response = await fetch(`http://localhost:3000/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete: ${response.statusText}`);
      }

      // If backend deletion is successful, also update the local/mock data
      if (deleteExpense) {
        deleteExpense(id); // This updates the mock/context data
      }

      // Call refresh to get updated data from server
      if (onRefresh) {
        onRefresh();
      }

      // Show success message
      toast({
        title: "Success",
        description: "Expense deleted successfully",
        variant: "default",
      });

    } catch (error: unknown) {
      console.error("Failed to delete expense:", error);

      // Derive a readable error message safely from unknown
      const message =
        error instanceof Error ? error.message :
        typeof error === "string" ? error :
        "Failed to delete expense";
      
      // Show error message
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      
    } finally {
      setIsDeleting(false);
      setDeleteId(undefined);
    }
  };

  const handleEditSuccess = () => {
    setEditingId(undefined);
    setModalOpen(false);
    if (onRefresh) {
      onRefresh();
    }
    toast({
      title: "Success",
      description: "Expense updated successfully",
      variant: "default",
    });
  };

  const editingExpense = editingId ? expenses.find((e) => e._id === editingId) : undefined;

  // Debug: Log what's being passed to handleDelete
  const handleDeleteClick = (id: string) => {
    console.log("Delete clicked for expense ID:", id);
    console.log("Expense object:", expenses.find(e => e._id === id));
    setDeleteId(id);
  };

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow key="no-expenses">
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No expenses found for this period
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell className="text-sm">
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {expense.amount} Birr
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {expense.note || '-'}
                  </TableCell>
                  <TableCell className="text-sm">{expense.recordedBy}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(expense._id)}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(expense._id)}
                      className="gap-2 text-destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ExpenseModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingId(undefined);
        }}
        editingId={editingId}
        expense={editingExpense}
        onSuccess={handleEditSuccess}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end space-x-2">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}