# Fantasy Football Analytics Setup
# Install required packages for ffanalytics integration

cat("🏈 Installing ffanalytics and dependencies...\n")

# Set up user library path  
user_lib <- "R-libs"
if (!dir.exists(user_lib)) {
  dir.create(user_lib, recursive = TRUE)
}
.libPaths(c(user_lib, .libPaths()))

cat("📁 Using library path:", .libPaths()[1], "\n")

# Install from CRAN with user library
if (!requireNamespace("remotes", quietly = TRUE)) {
  install.packages("remotes", lib = user_lib, repos = "https://cran.rstudio.com/")
}

# Install additional required packages
cat("⚡ Installing required packages...\n")
required_packages <- c("jsonlite", "httr", "plumber", "data.table", "dplyr", "tidyr")
for (pkg in required_packages) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    cat("Installing", pkg, "...\n")
    install.packages(pkg, lib = user_lib, repos = "https://cran.rstudio.com/", quiet = TRUE)
  }
}

# Install ffanalytics
cat("📦 Installing ffanalytics from GitHub...\n")
library(remotes, lib.loc = user_lib)
install_github("FantasyFootballAnalytics/ffanalytics", lib = user_lib, quiet = TRUE)

cat("✅ Installation complete! Ready for fantasy analytics.\n")
cat("📊 Installed packages in:", user_lib, "\n")