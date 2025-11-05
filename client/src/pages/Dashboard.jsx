import { useState, useEffect } from "react";
import API from "../api/axiosInstance";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
} from "@mui/material";
import {
  Search as SearchIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  Home as HomeIcon,
  Description as DocumentsIcon,
  Work as WorkIcon,
  Person as PersonalIcon,
  Image as PicturesIcon,
  GetApp as DownloadsIcon,
  Delete as TrashIcon,
  Storage as StorageIcon,
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Archive as ZipIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Code as CodeIcon,
  TableChart as SpreadsheetIcon,
  Apps as GridIcon,
  FormatListBulleted as ListIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [newFolder, setNewFolder] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPath, setCurrentPath] = useState(["Home"]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFileForMenu, setSelectedFileForMenu] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [trashFiles, setTrashFiles] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // "list" for file explorer style
  const [selectedItems, setSelectedItems] = useState([]);
  // Add this state for the logout modal
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Add this logout confirmation function
  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Sidebar menu items
  const menuItems = [
    { name: "Home", icon: <HomeIcon /> },
    { name: "Documents", icon: <DocumentsIcon /> },
    { name: "Work", icon: <WorkIcon /> },
    { name: "Personal", icon: <PersonalIcon /> },
    { name: "Pictures", icon: <PicturesIcon /> },
    { name: "Downloads", icon: <DownloadsIcon /> },
    { name: "Trash", icon: <TrashIcon /> },
  ];

  // ✅ Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // ✅ Fetch folders & files using your original API
  const fetchData = async () => {
    try {
      const { data } = await API.get("/files/folders");
      setFiles(data.files || []);
      setFolders(data.folders || []);

      // Load trash from localStorage or initialize empty
      const savedTrash = localStorage.getItem("trashFiles");
      if (savedTrash) {
        setTrashFiles(JSON.parse(savedTrash));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showSnackbar("Failed to load files", "error");
    }
  };

  // ✅ Upload file using your original API
  const handleUpload = async () => {
    if (!selectedFile) {
      showSnackbar("Please select a file first", "warning");
      return;
    }
    if (
      !selectedFolder ||
      selectedFolder === "Home" ||
      selectedFolder === "Trash"
    ) {
      showSnackbar("Please select a valid folder first", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("folder", selectedFolder);

    try {
      await API.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSelectedFile(null);
      setUploadDialogOpen(false);
      fetchData();
      showSnackbar("File uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      showSnackbar("Upload failed", "error");
    }
  };

  // ✅ Create new folder
  const handleCreateFolder = async () => {
    if (!newFolder.trim()) {
      showSnackbar("Please enter a folder name", "warning");
      return;
    }
    if (folders.includes(newFolder)) {
      showSnackbar("Folder already exists", "warning");
      return;
    }

    try {
      setFolders([...folders, newFolder]);
      setNewFolder("");
      showSnackbar("Folder created successfully!");
    } catch (error) {
      console.error("Failed to create folder:", error);
      showSnackbar("Failed to create folder", "error");
    }
  };

  // ✅ Move file to trash using your original API
  const handleMoveToTrash = async (file) => {
    if (!file) return;

    try {
      // Remove from current files
      const updatedFiles = files.filter((f) => f._id !== file._id);
      setFiles(updatedFiles);

      // Add to trash with deletion timestamp
      const fileWithTrashInfo = {
        ...file,
        deletedAt: new Date().toISOString(),
        originalFolder: file.folderName,
      };

      const updatedTrash = [...trashFiles, fileWithTrashInfo];
      setTrashFiles(updatedTrash);

      // Save trash to localStorage
      localStorage.setItem("trashFiles", JSON.stringify(updatedTrash));

      // Call your original API to delete the file from server
      await API.delete(`/files/${file._id}`);

      showSnackbar("File moved to trash");
      setDeleteDialogOpen(false);
      setFileToDelete(null);
      setSelectedItems([]);
    } catch (error) {
      console.error("Delete failed:", error);
      showSnackbar("Failed to delete file", "error");
    }
  };

  // ✅ Restore file from trash
  const handleRestoreFile = async (file) => {
    try {
      // Remove from trash
      const updatedTrash = trashFiles.filter((f) => f._id !== file._id);
      setTrashFiles(updatedTrash);
      localStorage.setItem("trashFiles", JSON.stringify(updatedTrash));

      // Add back to files
      const restoredFile = { ...file };
      delete restoredFile.deletedAt;
      delete restoredFile.originalFolder;

      setFiles((prev) => [...prev, restoredFile]);

      showSnackbar("File restored successfully!");
      setSelectedItems([]);
    } catch (error) {
      console.error("Restore failed:", error);
      showSnackbar("Failed to restore file", "error");
    }
  };

  // ✅ Permanently delete file from trash
  const handlePermanentDelete = async (file) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete "${file.fileName}"? This action cannot be undone.`
      )
    ) {
      try {
        const updatedTrash = trashFiles.filter((f) => f._id !== file._id);
        setTrashFiles(updatedTrash);
        localStorage.setItem("trashFiles", JSON.stringify(updatedTrash));

        showSnackbar("File permanently deleted");
        setSelectedItems([]);
      } catch (error) {
        console.error("Permanent delete failed:", error);
        showSnackbar("Failed to delete file", "error");
      }
    }
  };

  // ✅ Empty trash
  const handleEmptyTrash = () => {
    if (trashFiles.length === 0) {
      showSnackbar("Trash is already empty", "info");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to permanently delete all ${trashFiles.length} items from trash? This action cannot be undone.`
      )
    ) {
      setTrashFiles([]);
      localStorage.setItem("trashFiles", JSON.stringify([]));
      showSnackbar("Trash emptied successfully");
      setSelectedItems([]);
    }
  };

  // ✅ View file - called on double click
  const handleViewFile = (file) => {
    if (file.s3Url) {
      window.open(file.s3Url, "_blank");
    } else {
      showSnackbar("File URL not available", "error");
    }
  };

  // ✅ Download file
  const handleDownloadFile = (file) => {
    if (file.s3Url) {
      const link = document.createElement("a");
      link.href = file.s3Url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSnackbar("Download started");
    } else {
      showSnackbar("File URL not available", "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Filter files based on selected folder and search term
  const getFilteredFiles = () => {
    if (selectedFolder === "Trash") {
      return trashFiles.filter((file) =>
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return files.filter((file) => {
      const matchesFolder =
        !selectedFolder ||
        selectedFolder === "Home" ||
        file.folderName === selectedFolder;
      const matchesSearch = file.fileName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesFolder && matchesSearch;
    });
  };

  const filteredFiles = getFilteredFiles();

  // ✅ Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // ✅ Get file icon based on file type
  const getFileIcon = (file) => {
    const fileName = file.fileName.toLowerCase();

    if (
      file.type === "image" ||
      fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)
    ) {
      return <ImageIcon sx={{ color: "#4CAF50" }} />;
    }
    if (file.type === "pdf" || fileName.includes(".pdf")) {
      return <PdfIcon sx={{ color: "#f44336" }} />;
    }
    if (fileName.match(/\.(doc|docx|txt|rtf)$/)) {
      return <DocIcon sx={{ color: "#2196F3" }} />;
    }
    if (fileName.match(/\.(xls|xlsx|csv)$/)) {
      return <SpreadsheetIcon sx={{ color: "#4CAF50" }} />;
    }
    if (fileName.match(/\.(ppt|pptx)$/)) {
      return <VideoIcon sx={{ color: "#FF9800" }} />;
    }
    if (file.type === "zip" || fileName.match(/\.(zip|rar|7z|tar|gz)$/)) {
      return <ZipIcon sx={{ color: "#FF9800" }} />;
    }
    if (fileName.match(/\.(mp4|avi|mov|wmv|flv|webm)$/)) {
      return <VideoIcon sx={{ color: "#9C27B0" }} />;
    }
    if (fileName.match(/\.(mp3|wav|ogg|flac|aac)$/)) {
      return <AudioIcon sx={{ color: "#9C27B0" }} />;
    }
    if (
      fileName.match(/\.(js|jsx|ts|tsx|html|css|py|java|c|cpp|php|json|xml)$/)
    ) {
      return <CodeIcon sx={{ color: "#607D8B" }} />;
    }

    return <FileIcon sx={{ color: "#757575" }} />;
  };

  // ✅ Handle menu open
  const handleMenuOpen = (event, file) => {
    setAnchorEl(event.currentTarget);
    setSelectedFileForMenu(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFileForMenu(null);
  };

  // ✅ Handle folder click
  const handleFolderClick = (folderName) => {
    if (folderName === "Home") {
      setSelectedFolder(null);
      setCurrentPath(["Home"]);
    } else {
      setSelectedFolder(folderName);
      setCurrentPath(["Home", folderName]);
    }
    setSelectedItems([]);
  };

  // ✅ Handle file double click
  const handleFileDoubleClick = (file) => {
    if (selectedFolder === "Trash") {
      return;
    }
    handleViewFile(file);
  };

  // ✅ Handle item selection
  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // ✅ Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === filteredFiles.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredFiles.map((file) => file._id));
    }
  };

  // ✅ Render file explorer table view
  const renderFileExplorer = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={
                  selectedItems.length > 0 &&
                  selectedItems.length < filteredFiles.length
                }
                checked={
                  filteredFiles.length > 0 &&
                  selectedItems.length === filteredFiles.length
                }
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
              Name
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
              Size
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
              Type
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
              Modified
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredFiles.map((file) => {
            const fileExtension =
              file.fileName.split(".").pop()?.toUpperCase() || "FILE";
            const isSelected = selectedItems.includes(file._id);

            return (
              <TableRow
                key={file._id}
                sx={{
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#e3f2fd" : "transparent",
                  "&:hover": {
                    backgroundColor: isSelected ? "#e3f2fd" : "#f5f5f5",
                  },
                }}
                onDoubleClick={() => handleFileDoubleClick(file)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleSelectItem(file._id)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {getFileIcon(file)}
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {file.fileName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(file.fileSize)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={fileExtension}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.75rem" }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(file.uploadedAt || file.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, file)}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // ✅ Render folder grid for home view
  const renderFolderGrid = () => (
    <Grid container spacing={2}>
      {folders.map((folder) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={folder}>
          <Card
            sx={{
              cursor: "pointer",
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 3,
              },
            }}
            onClick={() => handleFolderClick(folder)}
          >
            <CardContent
              sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
            >
              <FolderIcon sx={{ fontSize: 40, color: "#ffa000" }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {folder}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {files.filter((f) => f.folderName === folder).length} items
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box
      sx={{ display: "flex", height: "100vh", backgroundColor: "#f5f5f5" }}
    >
      {/* Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: 280,
          boxSizing: "border-box",
          p: 2,
          backgroundColor: "white",
          borderRight: "1px solid #e0e0e0",
          borderRadius: 0,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow:"hidden",
          position: "relative",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{ p: 2, fontWeight: "bold", color: "#1976d2" }}
          >
            My Files
          </Typography>
          <Typography
            variant="body2"
            sx={{ px: 2, color: "text.secondary", mb: 2 }}
          >
            File Manager
          </Typography>

          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.name}
                button
                selected={
                  selectedFolder === item.name ||
                  (item.name === "Home" && !selectedFolder)
                }
                onClick={() => handleFolderClick(item.name)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {item.name}
                      {item.name === "Trash" && trashFiles.length > 0 && (
                        <Chip
                          label={trashFiles.length}
                          size="small"
                          color="error"
                          sx={{ height: 20, fontSize: "0.75rem" }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Logout as Nav Link at the bottom */}
        <Box sx={{ mt: "auto", borderTop: "1px solid #e0e0e0", pt: 1 }}>
          <List>
            <ListItem
              button
              onClick={() => setLogoutDialogOpen(true)}
              sx={{
                borderRadius: 1,
                color: "#d32f2f",
                "&:hover": {
                  backgroundColor: "#ffebee",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon sx={{ color: "#d32f2f" }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  sx: {
                    color: "#d32f2f",
                    fontWeight: 500,
                  },
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Paper>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 1 }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            size="small"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            size="small"
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
      {/* Main Content - Full Width */}
      <Box sx={{ flex: 1, minWidth: 0, p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {selectedFolder || "Home"}
            </Typography>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
              {currentPath.map((path, index) => (
                <Link
                  key={path}
                  color={
                    index === currentPath.length - 1
                      ? "text.primary"
                      : "inherit"
                  }
                  sx={{
                    cursor: "pointer",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={() => {
                    if (index === 0) {
                      handleFolderClick("Home");
                    } else {
                      handleFolderClick(path);
                    }
                  }}
                >
                  {path}
                </Link>
              ))}
            </Breadcrumbs>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 300,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />

            {selectedFolder === "Trash" ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteForeverIcon />}
                onClick={handleEmptyTrash}
                disabled={trashFiles.length === 0}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontSize: "0.875rem",
                }}
              >
                Empty Trash
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
                disabled={selectedFolder === "Trash"}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontSize: "0.875rem",
                }}
              >
                Upload
              </Button>
            )}
          </Box>
        </Box>

        {/* Files Display */}
        {(!selectedFolder || selectedFolder === "Home") &&
        selectedFolder !== "Trash"
          ? // Home view - show folders
            renderFolderGrid()
          : selectedFolder &&
            selectedFolder !== "Home" && (
              // Folder view - show files in explorer style
              <>
                {filteredFiles.length === 0 ? (
                  <Box sx={{ p: 8, textAlign: "center" }}>
                    <FolderIcon
                      sx={{
                        fontSize: 64,
                        color: "text.secondary",
                        mb: 2,
                        opacity: 0.5,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      {selectedFolder === "Trash"
                        ? "Trash is empty"
                        : "No files in this folder"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedFolder === "Trash"
                        ? "Deleted files will appear here"
                        : "Upload files to get started"}
                    </Typography>
                  </Box>
                ) : (
                  renderFileExplorer()
                )}
              </>
            )}

        {/* Create Folder Section - Hide for Trash */}
        {selectedFolder !== "Trash" &&
          (!selectedFolder || selectedFolder === "Home") && (
            <Paper sx={{ p: 2, borderRadius: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: "1rem" }}>
                Create New Folder
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                  label="Folder Name"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  sx={{ flex: 1 }}
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateFolder();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleCreateFolder}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    fontSize: "0.875rem",
                  }}
                >
                  Create Folder
                </Button>
              </Box>
            </Paper>
          )}
      </Box>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Upload File</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a file to upload to {selectedFolder || "a folder"}
          </Typography>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{ width: "100%", marginTop: "8px" }}
          />
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUploadDialogOpen(false)} size="small">
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile}
            size="small"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 1, fontSize: "1rem" }}>
          Move to Trash
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to move "{fileToDelete?.fileName}" to trash?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You can restore it from trash later if needed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} size="small">
            Cancel
          </Button>
          <Button
            onClick={() => handleMoveToTrash(fileToDelete)}
            color="warning"
            variant="contained"
            size="small"
          >
            Move to Trash
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu for Normal Files */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && selectedFolder !== "Trash"}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleViewFile(selectedFileForMenu);
            handleMenuClose();
          }}
        >
          <ViewIcon sx={{ mr: 1, fontSize: 20 }} /> View
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDownloadFile(selectedFileForMenu);
            handleMenuClose();
          }}
        >
          <DownloadIcon sx={{ mr: 1, fontSize: 20 }} /> Download
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFileToDelete(selectedFileForMenu);
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: "warning.main" }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} /> Move to Trash
        </MenuItem>
      </Menu>

      {/* Context Menu for Trash Files */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && selectedFolder === "Trash"}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleRestoreFile(selectedFileForMenu);
            handleMenuClose();
          }}
        >
          <RestoreIcon sx={{ mr: 1, fontSize: 20 }} /> Restore
        </MenuItem>
        <MenuItem
          onClick={() => {
            handlePermanentDelete(selectedFileForMenu);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteForeverIcon sx={{ mr: 1, fontSize: 20 }} /> Delete Permanently
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 1, fontSize: "0.875rem" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
