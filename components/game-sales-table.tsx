'use client';

import { useState } from 'react';
import { GameSale, useData } from '@/lib/data-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { GameSaleModal } from './game-sale-modal';
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
import { toast } from '@/components/ui/use-toast'; // If you have toast

interface GameSalesTableProps {
  gameSales: GameSale[];
  dateRange: { from: Date; to: Date };
  onRefresh?: () => void; 
}

export function GameSalesTable({ gameSales, dateRange, onRefresh }: GameSalesTableProps) {
  const { deleteGameSale } = useData(); // This might be local/mock function
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [deleteId, setDeleteId] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);
  const filteredSales = gameSales;

  const handleEdit = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error("No ID provided for deletion");
      return;
    }
    
    setIsDeleting(true);
    try {
      // First, try to delete from the actual backend API
      // Adjust the endpoint based on your actual backend route
      const response = await fetch(`http://localhost:3000/game/${id}`, {
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
      if (deleteGameSale) {
        deleteGameSale(id); // This updates the mock/context data
      }

      // Call refresh to get updated data from server
      if (onRefresh) {
        onRefresh();
      }

      // Show success message
      toast({
        title: "Success",
        description: "Game sale deleted successfully",
        variant: "default",
      });

    } catch (error) {
      console.error("Failed to delete game sale:", error);
      
      // Normalize unknown error to a string/message
      const errMsg =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : JSON.stringify(error) || "Failed to delete game sale";

      // Show error message
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
      
      // If backend fails, you might still want to remove it from local state
      // depending on your requirements:
      // deleteGameSale(id); // Uncomment if you want optimistic updates
      
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
      description: "Game sale updated successfully",
      variant: "default",
    });
  };

  const editingSale = editingId ? gameSales.find((s) => s._id === editingId) : undefined;

  // Debug: Log what's being passed to handleDelete
  const handleDeleteClick = (id: string) => {
    console.log("Delete clicked for ID:", id);
    console.log("Sale object:", gameSales.find(s => s._id === id));
    setDeleteId(id);
  };

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>PS Station</TableHead>
              <TableHead className="text-right">Games</TableHead>
              <TableHead className="text-right">Price/Game</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow key="no-sales">
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No game sales found for this period
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell className="text-sm">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{sale.consoleId}</TableCell>
                  <TableCell className="text-right">{sale.gamesPlayed}</TableCell>
                  <TableCell className="text-right">{sale.pricePerGame} Birr</TableCell>
                  <TableCell className="text-right font-semibold">
                    {sale.totalAmount} Birr
                  </TableCell>
                  <TableCell className="text-sm">{sale.recordedBy}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(sale._id)}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(sale._id)}
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

      <GameSaleModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingId(undefined);
        }}
        editingId={editingId}
        sale={editingSale}
        onSuccess={handleEditSuccess}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Game Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this game sale? This action cannot be undone.
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