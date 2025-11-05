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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

export default function Register() {
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "",
    confirmPassword: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    try {
      await API.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password
      });
      navigate("/login", { 
        state: { message: "Registration successful! Please login to continue." } 
      });
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <CloudIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      title: "Free Storage",
      description: "Get started with 5GB of free secure cloud storage"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: "#2e7d32" }} />,
      title: "Secure & Private",
      description: "Your files are encrypted and protected with bank-level security"
    },
    {
      icon: <StorageIcon sx={{ fontSize: 40, color: "#ed6c02" }} />,
      title: "Any Device Access",
      description: "Access your files from desktop, tablet, or mobile"
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: "#9c27b0" }} />,
      title: "Fast Transfers",
      description: "High-speed file uploads and downloads"
    }
  ];

  const passwordRequirements = [
    { text: "At least 8 characters", met: form.password.length >= 8 },
    { text: "Contains a number", met: /\d/.test(form.password) },
    { text: "Contains a special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} className="Big-container" alignItems="center">
         

          {/* Right Side - Register Form */}
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={1000}>
              <Paper
                elevation={10}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  maxWidth: 450,
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
                    Create Account
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Join Personal Cloud today
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
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
                      mb: 1,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />

                  {/* Password Requirements */}
                  {form.password && (
                    <Box sx={{ mb: 2, pl: 2 }}>
                      {passwordRequirements.map((req, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <CheckCircleIcon 
                            sx={{ 
                              fontSize: 16, 
                              color: req.met ? '#2e7d32' : '#bdbdbd',
                              mr: 1 
                            }} 
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: req.met ? '#2e7d32' : 'text.secondary',
                              fontSize: '0.75rem'
                            }}
                          >
                            {req.text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  <TextField
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                    error={form.confirmPassword && form.password !== form.confirmPassword}
                    helperText={form.confirmPassword && form.password !== form.confirmPassword ? "Passwords do not match" : ""}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
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

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{" "}
                        <Link to="/terms" style={{ color: '#1976d2', textDecoration: 'none' }}>
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" style={{ color: '#1976d2', textDecoration: 'none' }}>
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                    sx={{ mb: 3 }}
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
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?
                  </Typography>
                </Divider>

                <Button
                  component={Link}
                  to="/login"
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
                  Sign In to Existing Account
                </Button>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 3, 
                    textAlign: "center",
                    opacity: 0.7,
                    fontSize: '0.75rem'
                  }}
                >
                  By creating an account, you get 5GB of free storage
                </Typography>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}