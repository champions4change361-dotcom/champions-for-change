# Start the Fantasy Analytics R API server
# This runs the R API on port 8080

library(plumber)

cat("🏈 Starting Fantasy Analytics R API...\n")

# Create and run the API
pr <- plumb("api.R")
pr$run(host = "0.0.0.0", port = 8080)