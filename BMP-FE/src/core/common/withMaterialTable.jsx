// components/withMaterialTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import RoutePath from "../constants/routes.constant";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Box,
  Typography,
  Stack,
  Alert,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import { showError } from "../utils/toast.util";

// Unified mobile breakpoint — matches Tailwind sm: and DashboardLayout
const MOBILE_BREAKPOINT = "(max-width: 639px)";

const withMaterialTable = (WrappedComponent, tableConfig) => {
  return () => {
    const [data, setData] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const [selectedRow, setSelectedRow] = useState({});
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentRow, setCurrentRow] = useState(null);
    const navigate = useNavigate();

    // ── Responsive column visibility ─────────────────────────────────────────
    // Each tableConfig can declare `mobileHiddenColumns: ["col1", "col2"]`
    // to automatically hide non-essential columns on small screens.
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

    const columnVisibility = useMemo(() => {
      if (!tableConfig.mobileHiddenColumns?.length) return {};
      return tableConfig.mobileHiddenColumns.reduce((acc, col) => {
        acc[col] = !isMobile; // hidden when mobile, visible otherwise
        return acc;
      }, {});
    }, [isMobile]);

    // Fetch data on load
    useEffect(() => {
      const fetchData = async () => {
        setFetchError(null);
        try {
          const result = await tableConfig.getData();
          setData(result);
        } catch (error) {
          console.error("Error fetching data:", error);
          const msg = "Failed to load data. Please refresh the page.";
          setFetchError(msg);
          showError(msg);
        }
      };
      fetchData();
    }, [tableConfig]);

    // Dialog controls
    const openAddDialog = () => {
      setSelectedRow({});
      setIsAddOpen(true);
    };

    const openEditDialog = (rowData) => {
      setSelectedRow(rowData);
      setIsEditOpen(true);
    };


    const openViewDialog = (rowData) => {
      navigate(`${RoutePath.ADMIN_BASE}/userdetails/${rowData.id}`);
    };

    const closeDialogs = () => {
      setIsAddOpen(false);
      setIsEditOpen(false);
      setIsViewOpen(false);
      setSelectedRow({});
    };

    // CRUD handlers
    const handleAddSubmit = async () => {
      try {
        const result = await tableConfig.addData(selectedRow);
        setData((prev) => (Array.isArray(result) ? result : [...prev, result]));
        closeDialogs();
      } catch (err) {
        console.error("Add error:", err);
      }
    };

    const handleEditSubmit = async () => {
      try {
        const result = await tableConfig.updateData(selectedRow);
        setData((prev) =>
          Array.isArray(result)
            ? result
            : prev.map((item) => (item.id === selectedRow.id ? result : item))
        );
        closeDialogs();
      } catch (err) {
        console.error("Edit error:", err);
      }
    };

    const handleDelete = async (rowData) => {
      if (window.confirm("Are you sure you want to delete this item?")) {
        try {
          const result = await tableConfig.deleteData(rowData.id);
          setData((prev) =>
            Array.isArray(result) ? result : prev.filter((item) => item.id !== rowData.id)
          );
        } catch (err) {
          console.error("Delete error:", err);
        }
      }
    };

    // Render form fields dynamically
    const renderFormFields = () => {
      if (typeof tableConfig.customFormFields === "function") {
        return tableConfig.customFormFields(selectedRow, setSelectedRow);
      }

      return tableConfig.columns.map((col) => {
        const value = selectedRow[col.accessorKey] || "";

        // Dropdown select
        if (col.editVariant === "select" && Array.isArray(col.editSelectOptions)) {
          return (
            <TextField
              key={col.accessorKey}
              margin="dense"
              label={col.header}
              fullWidth
              select
              value={value}
              onChange={(e) =>
                setSelectedRow((prev) => ({ ...prev, [col.accessorKey]: e.target.value }))
              }
            >
              {col.editSelectOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          );
        }

        // Default text input
        return (
          <TextField
            key={col.accessorKey}
            margin="dense"
            label={col.header}
            fullWidth
            value={value}
            onChange={(e) =>
              setSelectedRow((prev) => ({ ...prev, [col.accessorKey]: e.target.value }))
            }
          />
        );
      });
    };


    // Add actions column dynamically
    const columns = useMemo(() => {
      if (tableConfig.disableDefaultActions) return tableConfig.columns;

      return [
        ...tableConfig.columns,
        {
          id: "actions",
          header: "ACTIONS",
          Cell: ({ row }) => (
            <>
              <IconButton
                aria-label="Row actions"
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                  setCurrentRow(row.original);
                }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && currentRow?.id === row.original.id}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    if (tableConfig.onView) {
                      tableConfig.onView(currentRow, navigate);
                    }
                    setAnchorEl(null);
                  }}
                >
                  View
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    openEditDialog(currentRow);
                    setAnchorEl(null);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleDelete(currentRow);
                    setAnchorEl(null);
                  }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </>
          ),
        },
      ];
    }, [anchorEl, currentRow, tableConfig]);

    return (
      <Box sx={{
        width: "100%",
        maxWidth: 1600,
        mx: "auto",
        overflowX: "auto",
      }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" sx={{ color: "gray900" }}>
            {tableConfig.title}
          </Typography>
        </Stack>

        {/* Inline error state — shown in addition to the toast */}
        {fetchError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFetchError(null)}>
            {fetchError}
          </Alert>
        )}

        {/* Material React Table */}
        <MaterialReactTable
          columns={columns}
          data={data}
          enableSorting
          enablePagination
          enableRowSelection={false}
          enableGlobalFilter
          // ── Column visibility — secondary columns hidden on mobile ──────────
          // Users can still toggle them via the column visibility menu (MRT built-in)
          initialState={{
            columnVisibility,
          }}
          // Keep visibility in sync when screen resizes
          state={{
            columnVisibility,
          }}
          muiTableHeadRowProps={{ sx: { backgroundColor: "#f0fdf4" } }}
          muiTableHeadCellProps={{ sx: { color: "gray900", fontWeight: "bold", whiteSpace: "nowrap" } }}
          muiTableBodyCellProps={{ sx: { whiteSpace: "nowrap", fontSize: "0.8rem" } }}
          muiTableContainerProps={{
            sx: {
              overflowX: "auto",
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: 4 },
              "&::-webkit-scrollbar-thumb": { background: "#c1c1c1", borderRadius: 4 },
              "&::-webkit-scrollbar-thumb:hover": { background: "#a1a1a1" },
            }
          }}
          defaultColumn={{ maxSize: 180, minSize: 60 }}
        />

        {/* Add / Edit / View Dialogs */}
        <Dialog open={isAddOpen} onClose={closeDialogs} fullWidth>
          <DialogTitle>Add New</DialogTitle>
          <DialogContent>{renderFormFields()}</DialogContent>
          <DialogActions>
            <Button onClick={closeDialogs}>Cancel</Button>
            <Button onClick={handleAddSubmit}>Add</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isEditOpen} onClose={closeDialogs} fullWidth>
          <DialogTitle>Edit</DialogTitle>
          <DialogContent>{renderFormFields()}</DialogContent>
          <DialogActions>
            <Button onClick={closeDialogs}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Update</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };
};

export default withMaterialTable;
