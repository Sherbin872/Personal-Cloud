import { useState, useEffect } from "react";
import API from "../api/axiosInstance";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [newFolder, setNewFolder] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ Fetch folders & files
  const fetchData = async () => {
    const { data } = await API.get("/files/folders");
    setFiles(data.files);
    setFolders(data.folders);
  };

  // ✅ Upload file
  const handleUpload = async () => {
    if (!selectedFile) return alert("Select a file first");
    if (!selectedFolder) return alert("Select a folder first");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("folder", selectedFolder);

    await API.post("/files/upload", formData);
    setSelectedFile(null);
    fetchData();
  };

  // ✅ Create new folder
  const handleCreateFolder = () => {
    if (!newFolder.trim()) return alert("Enter folder name");
    if (folders.includes(newFolder)) return alert("Folder already exists");
    setFolders([...folders, newFolder]);
    setNewFolder("");
  };

  // ✅ Delete file
  const handleDelete = async (id) => {
    await API.delete(`/files/${id}`);
    fetchData();
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Filter files based on selected folder
  const filteredFiles = files.filter((f) => f.folderName === selectedFolder);

  // ✅ Go back to folder view
  const goBack = () => setSelectedFolder(null);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Personal Cloud
      </Typography>

      {/* Logout */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="outlined" onClick={logout}>
          Logout
        </Button>
      </Box>

      {/* Create Folder */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          label="New Folder"
          value={newFolder}
          onChange={(e) => setNewFolder(e.target.value)}
        />
        <Button variant="contained" onClick={handleCreateFolder}>
          Create Folder
        </Button>
      </Box>

      {/* FOLDER VIEW */}
      {!selectedFolder ? (
        <>
          <Typography variant="h6">📁 Your Folders</Typography>
          {folders.length === 0 ? (
            <Typography>No folders found</Typography>
          ) : (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {folders.map((folder) => (
                <Grid item xs={12} sm={6} md={4} key={folder}>
                  <Card
                    onClick={() => setSelectedFolder(folder)}
                    sx={{
                      cursor: "pointer",
                      p: 2,
                      "&:hover": { boxShadow: 4, backgroundColor: "#f9f9f9" },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">📁 {folder}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        /* FILE VIEW */
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Button variant="outlined" onClick={goBack}>
              ⬅ Back
            </Button>
            <Typography variant="h6">{selectedFolder} Folder</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <Button variant="contained" onClick={handleUpload}>
              Upload
            </Button>
          </Box>

          {filteredFiles.length === 0 ? (
            <Typography>No files in this folder</Typography>
          ) : (
            filteredFiles.map((file) => (
              <Card key={file._id} sx={{ mb: 2, p: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">{file.fileName}</Typography>
                  <Typography variant="body2">
                    Size: {(file.fileSize / 1024).toFixed(2)} KB
                  </Typography>
                  <Button
                    variant="contained"
                    href={file.s3Url}
                    target="_blank"
                    sx={{ mt: 1, mr: 1 }}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ mt: 1 }}
                    onClick={() => handleDelete(file._id)}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </Box>
  );
}
