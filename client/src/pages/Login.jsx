import { useState } from "react";
import API from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Grid,
  Fade,
  Slide,
  Zoom,
  InputAdornment,
  Divider,
  Alert,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <CloudIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      title: "Cloud Storage",
      description: "Secure and reliable cloud storage for all your files"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: "#2e7d32" }} />,
      title: "Bank-level Security",
      description: "Your files are protected with enterprise-grade encryption"
    },
    {
      icon: <StorageIcon sx={{ fontSize: 40, color: "#ed6c02" }} />,
      title: "Unlimited Access",
      description: "Access your files from anywhere, on any device"
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: "#9c27b0" }} />,
      title: "Lightning Fast",
      description: "High-speed uploads and downloads for all file types"
    }
  ];

  return (
    <Box
      sx={{
        height: "90vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid   className="Big-container" >
         

          {/* Right Side - Login Form */}
          <Grid className="rightLogin" item xs={12} md={6}>
            <Fade in={true} timeout={1000}>
              <Paper
                elevation={10}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  maxWidth: 400,
                  mx: "auto",
                }}
              >
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <CloudIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: "#1976d2",
                      mb: 2,
                    }} 
                  />
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sign in to your Personal Cloud
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 4,
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    New to Personal Cloud?
                  </Typography>
                </Divider>

                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: "1rem",
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      borderColor: "#1565c0",
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  Create New Account
                </Button>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 3, 
                    textAlign: "center",
                    opacity: 0.7,
                  }}
                >
                  Secure • Reliable • Fast
                </Typography>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}