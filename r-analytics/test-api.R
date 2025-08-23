# Quick test of R analytics functionality
# This tests the basic API without plumber for now

# Set library path
.libPaths(c("R-libs", .libPaths()))

# Load available packages
library(jsonlite)

cat("🚀 Testing R Analytics...\n")

# Test function to get projections
get_projections <- function(position = "RB") {
  cat("📊 Getting projections for", position, "\n")
  
  # Mock projections for now
  projections <- switch(position,
    "RB" = list(
      list(player = "Christian McCaffrey", team = "SF", points = 18.5, rank = 1, confidence = 92),
      list(player = "Saquon Barkley", team = "PHI", points = 17.2, rank = 2, confidence = 89),
      list(player = "Jonathan Taylor", team = "IND", points = 16.8, rank = 3, confidence = 87),
      list(player = "Austin Ekeler", team = "WSH", points = 15.9, rank = 4, confidence = 84),
      list(player = "Bijan Robinson", team = "ATL", points = 15.6, rank = 5, confidence = 82)
    ),
    "WR" = list(
      list(player = "Cooper Kupp", team = "LAR", points = 19.1, rank = 1, confidence = 91),
      list(player = "Davante Adams", team = "LV", points = 18.7, rank = 2, confidence = 89),
      list(player = "Tyreek Hill", team = "MIA", points = 18.3, rank = 3, confidence = 88),
      list(player = "Stefon Diggs", team = "HOU", points = 17.9, rank = 4, confidence = 86),
      list(player = "A.J. Brown", team = "PHI", points = 17.5, rank = 5, confidence = 85)
    ),
    "QB" = list(
      list(player = "Josh Allen", team = "BUF", points = 24.2, rank = 1, confidence = 94),
      list(player = "Lamar Jackson", team = "BAL", points = 23.5, rank = 2, confidence = 92),
      list(player = "Dak Prescott", team = "DAL", points = 22.1, rank = 3, confidence = 88),
      list(player = "Jalen Hurts", team = "PHI", points = 21.8, rank = 4, confidence = 86),
      list(player = "Tua Tagovailoa", team = "MIA", points = 20.9, rank = 5, confidence = 82)
    ),
    list(list(player = "No data", team = "N/A", points = 0, rank = 0, confidence = 0))
  )
  
  result <- list(
    success = TRUE,
    position = position,
    projections = projections,
    source = "r-analytics-mock",
    timestamp = Sys.time()
  )
  
  return(result)
}

# Test the function
test_rb <- get_projections("RB")
cat("✅ RB projections:", length(test_rb$projections), "players\n")

test_wr <- get_projections("WR") 
cat("✅ WR projections:", length(test_wr$projections), "players\n")

# Output JSON
cat("📄 Sample JSON output:\n")
cat(toJSON(test_rb, pretty = TRUE, auto_unbox = TRUE))

cat("\n\n🎯 R Analytics test complete!\n")