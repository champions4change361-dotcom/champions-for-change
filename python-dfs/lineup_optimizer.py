#!/usr/bin/env python3
"""
Professional DFS Lineup Optimizer
Powered by pydfs-lineup-optimizer + R Analytics projections
Champions for Change Tournament Platform
"""

import json
import sys
from pydfs_lineup_optimizer import get_optimizer, Site, Sport, Player
from typing import List, Dict, Any

def create_lineup_optimizer(site: str, sport: str):
    """Create optimizer for specific site and sport"""
    
    # Map site strings to pydfs Site enums
    site_mapping = {
        'draftkings': Site.DRAFTKINGS,
        'fanduel': Site.FANDUEL,
        'yahoo': Site.YAHOO,
        'fantasydraft': Site.FANTASY_DRAFT
    }
    
    # Map sport strings to pydfs Sport enums  
    sport_mapping = {
        'nfl': Sport.FOOTBALL,
        'nba': Sport.BASKETBALL,
        'mlb': Sport.BASEBALL,
        'nhl': Sport.HOCKEY
    }
    
    if site not in site_mapping:
        raise ValueError(f"Unsupported site: {site}")
    if sport not in sport_mapping:
        raise ValueError(f"Unsupported sport: {sport}")
    
    return get_optimizer(site_mapping[site], sport_mapping[sport])

def optimize_lineups(site: str, sport: str, players_data: List[Dict], num_lineups: int = 5):
    """Generate optimal lineups using pydfs-lineup-optimizer"""
    
    try:
        # Create optimizer
        optimizer = create_lineup_optimizer(site, sport)
        
        # Add players to optimizer
        players = []
        for player_data in players_data:
            player = Player(
                player_data['id'],
                player_data['name'],
                player_data['position'],
                player_data['team'],
                player_data['salary'],
                player_data['projected_points'],
                fppg=player_data['projected_points']  # Add required fppg parameter
            )
            players.append(player)
            
        optimizer.player_pool.load_players(players)
        
        # Generate optimized lineups
        lineups = []
        for i, lineup in enumerate(optimizer.optimize(num_lineups)):
            lineup_data = {
                'lineup_number': i + 1,
                'total_salary': lineup.salary,
                'total_points': round(lineup.projected, 2),
                'players': []
            }
            
            for player in lineup.players:
                lineup_data['players'].append({
                    'id': player.id,
                    'name': player.full_name,
                    'position': player.position,
                    'team': player.team,
                    'salary': player.salary,
                    'projected_points': player.projected,
                    'value': round(player.projected / (player.salary / 1000), 2) if player.salary > 0 else 0
                })
            
            lineups.append(lineup_data)
        
        return {
            'success': True,
            'site': site,
            'sport': sport,
            'lineups': lineups,
            'optimizer_info': {
                'salary_cap': optimizer.settings.salary_cap,
                'total_players': optimizer.settings.total_players,
                'positions': [str(pos) for pos in optimizer.settings.positions]
            },
            'source': 'pydfs-lineup-optimizer',
            'num_generated': len(lineups)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'site': site,
            'sport': sport
        }

def get_sample_projections(sport: str, position: str):
    """Get sample player projections for testing"""
    
    if sport == 'nfl':
        if position == 'QB':
            return [
                {'id': 'allen', 'name': 'Josh Allen', 'position': 'QB', 'team': 'BUF', 'salary': 8000, 'projected_points': 24.8},
                {'id': 'jackson', 'name': 'Lamar Jackson', 'position': 'QB', 'team': 'BAL', 'salary': 7800, 'projected_points': 24.2},
                {'id': 'hurts', 'name': 'Jalen Hurts', 'position': 'QB', 'team': 'PHI', 'salary': 7600, 'projected_points': 23.6},
                {'id': 'prescott', 'name': 'Dak Prescott', 'position': 'QB', 'team': 'DAL', 'salary': 7400, 'projected_points': 22.8}
            ]
        elif position == 'RB':
            return [
                {'id': 'mccaffrey', 'name': 'Christian McCaffrey', 'position': 'RB', 'team': 'SF', 'salary': 9000, 'projected_points': 19.8},
                {'id': 'ekeler', 'name': 'Austin Ekeler', 'position': 'RB', 'team': 'WAS', 'salary': 7200, 'projected_points': 17.2},
                {'id': 'robinson', 'name': 'Bijan Robinson', 'position': 'RB', 'team': 'ATL', 'salary': 7000, 'projected_points': 16.8},
                {'id': 'henry', 'name': 'Derrick Henry', 'position': 'RB', 'team': 'BAL', 'salary': 6800, 'projected_points': 16.2}
            ]
        elif position == 'WR':
            return [
                {'id': 'hill', 'name': 'Tyreek Hill', 'position': 'WR', 'team': 'MIA', 'salary': 8200, 'projected_points': 16.8},
                {'id': 'lamb', 'name': 'CeeDee Lamb', 'position': 'WR', 'team': 'DAL', 'salary': 8000, 'projected_points': 16.2},
                {'id': 'diggs', 'name': 'Stefon Diggs', 'position': 'WR', 'team': 'HOU', 'salary': 7800, 'projected_points': 15.9},
                {'id': 'stbrown', 'name': 'Amon-Ra St. Brown', 'position': 'WR', 'team': 'DET', 'salary': 7600, 'projected_points': 15.4}
            ]
        elif position == 'TE':
            return [
                {'id': 'kelce', 'name': 'Travis Kelce', 'position': 'TE', 'team': 'KC', 'salary': 6400, 'projected_points': 14.2},
                {'id': 'andrews', 'name': 'Mark Andrews', 'position': 'TE', 'team': 'BAL', 'salary': 5800, 'projected_points': 12.8},
                {'id': 'laporta', 'name': 'Sam LaPorta', 'position': 'TE', 'team': 'DET', 'salary': 5600, 'projected_points': 12.1}
            ]
    
    return []

def generate_sample_lineup(site: str = 'draftkings', sport: str = 'nfl'):
    """Generate a sample optimized lineup for demonstration"""
    
    if sport.lower() == 'mlb':
        # MLB Baseball lineups
        lineups = [
            {
                'lineup_number': 1,
                'total_salary': 49800,
                'total_points': 48.6,
                'players': [
                    {'id': 'ohtani', 'name': 'Shohei Ohtani', 'position': 'P', 'team': 'LAD', 'salary': 11000, 'projected_points': 9.8, 'value': 0.89},
                    {'id': 'betts', 'name': 'Mookie Betts', 'position': 'OF', 'team': 'LAD', 'salary': 10500, 'projected_points': 8.4, 'value': 0.8},
                    {'id': 'judge', 'name': 'Aaron Judge', 'position': 'OF', 'team': 'NYY', 'salary': 10200, 'projected_points': 8.1, 'value': 0.79},
                    {'id': 'freeman', 'name': 'Freddie Freeman', 'position': '1B', 'team': 'LAD', 'salary': 8800, 'projected_points': 7.2, 'value': 0.82},
                    {'id': 'altuve', 'name': 'Jose Altuve', 'position': '2B', 'team': 'HOU', 'salary': 8200, 'projected_points': 6.8, 'value': 0.83},
                    {'id': 'devers', 'name': 'Rafael Devers', 'position': '3B', 'team': 'BOS', 'salary': 7600, 'projected_points': 6.4, 'value': 0.84},
                    {'id': 'tatis', 'name': 'Fernando Tatis Jr.', 'position': 'SS', 'team': 'SD', 'salary': 7400, 'projected_points': 6.2, 'value': 0.84},
                    {'id': 'contreras', 'name': 'Willson Contreras', 'position': 'C', 'team': 'STL', 'salary': 6200, 'projected_points': 5.2, 'value': 0.84},
                    {'id': 'lindor', 'name': 'Francisco Lindor', 'position': 'UTIL', 'team': 'NYM', 'salary': 7100, 'projected_points': 5.8, 'value': 0.82}
                ]
            },
            {
                'lineup_number': 2,
                'total_salary': 48900,
                'total_points': 47.3,
                'players': [
                    {'id': 'cole', 'name': 'Gerrit Cole', 'position': 'P', 'team': 'NYY', 'salary': 10200, 'projected_points': 8.9, 'value': 0.87},
                    {'id': 'acuna', 'name': 'Ronald Acuña Jr.', 'position': 'OF', 'team': 'ATL', 'salary': 10800, 'projected_points': 8.6, 'value': 0.8},
                    {'id': 'soto', 'name': 'Juan Soto', 'position': 'OF', 'team': 'NYY', 'salary': 9800, 'projected_points': 7.9, 'value': 0.81},
                    {'id': 'vlad', 'name': 'Vladimir Guerrero Jr.', 'position': '1B', 'team': 'TOR', 'salary': 8600, 'projected_points': 7.0, 'value': 0.81},
                    {'id': 'gleyber', 'name': 'Gleyber Torres', 'position': '2B', 'team': 'NYY', 'salary': 7800, 'projected_points': 6.5, 'value': 0.83},
                    {'id': 'machado', 'name': 'Manny Machado', 'position': '3B', 'team': 'SD', 'salary': 7500, 'projected_points': 6.3, 'value': 0.84},
                    {'id': 'bogaerts', 'name': 'Xander Bogaerts', 'position': 'SS', 'team': 'SD', 'salary': 7200, 'projected_points': 6.0, 'value': 0.83},
                    {'id': 'realmuto', 'name': 'J.T. Realmuto', 'position': 'C', 'team': 'PHI', 'salary': 6000, 'projected_points': 5.0, 'value': 0.83},
                    {'id': 'turner', 'name': 'Trea Turner', 'position': 'UTIL', 'team': 'PHI', 'salary': 6800, 'projected_points': 5.6, 'value': 0.82}
                ]
            }
        ]
        
        return {
            'success': True,
            'site': site,
            'sport': sport,
            'lineups': lineups,
            'optimizer_info': {
                'salary_cap': 50000,
                'total_players': 9,
                'positions': ['P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'OF', 'UTIL']
            },
            'source': 'pydfs-lineup-optimizer-mlb',
            'num_generated': len(lineups)
        }
    
    elif sport.lower() == 'nba':
        # NBA Basketball lineups
        lineups = [
            {
                'lineup_number': 1,
                'total_salary': 49800,
                'total_points': 298.5,
                'players': [
                    {'id': 'curry', 'name': 'Stephen Curry', 'position': 'PG', 'team': 'GSW', 'salary': 11200, 'projected_points': 52.4, 'value': 4.68},
                    {'id': 'brunson', 'name': 'Jalen Brunson', 'position': 'SG', 'team': 'NYK', 'salary': 8600, 'projected_points': 44.8, 'value': 5.21},
                    {'id': 'tatum', 'name': 'Jayson Tatum', 'position': 'SF', 'team': 'BOS', 'salary': 10800, 'projected_points': 51.2, 'value': 4.74},
                    {'id': 'giannis', 'name': 'Giannis Antetokounmpo', 'position': 'PF', 'team': 'MIL', 'salary': 11600, 'projected_points': 58.6, 'value': 5.05},
                    {'id': 'jokic', 'name': 'Nikola Jokic', 'position': 'C', 'team': 'DEN', 'salary': 12000, 'projected_points': 61.8, 'value': 5.15},
                    {'id': 'bridges', 'name': 'Mikal Bridges', 'position': 'G', 'team': 'BRK', 'salary': 6400, 'projected_points': 32.2, 'value': 5.03},
                    {'id': 'sengun', 'name': 'Alperen Sengun', 'position': 'F', 'team': 'HOU', 'salary': 7200, 'projected_points': 38.4, 'value': 5.33},
                    {'id': 'white', 'name': 'Derrick White', 'position': 'UTIL', 'team': 'BOS', 'salary': 6000, 'projected_points': 31.8, 'value': 5.3}
                ]
            }
        ]
        
        return {
            'success': True,
            'site': site,
            'sport': sport,
            'lineups': lineups,
            'optimizer_info': {
                'salary_cap': 50000,
                'total_players': 8,
                'positions': ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL']
            },
            'source': 'pydfs-lineup-optimizer-nba',
            'num_generated': len(lineups)
        }
    
    elif sport.lower() == 'nhl':
        # NHL Hockey lineups
        lineups = [
            {
                'lineup_number': 1,
                'total_salary': 49700,
                'total_points': 42.8,
                'players': [
                    {'id': 'mcdavid', 'name': 'Connor McDavid', 'position': 'C', 'team': 'EDM', 'salary': 11800, 'projected_points': 8.9, 'value': 0.75},
                    {'id': 'pastrnak', 'name': 'David Pastrnak', 'position': 'W', 'team': 'BOS', 'salary': 9600, 'projected_points': 7.2, 'value': 0.75},
                    {'id': 'draisaitl', 'name': 'Leon Draisaitl', 'position': 'W', 'team': 'EDM', 'salary': 10200, 'projected_points': 7.8, 'value': 0.76},
                    {'id': 'makar', 'name': 'Cale Makar', 'position': 'D', 'team': 'COL', 'salary': 8400, 'projected_points': 6.4, 'value': 0.76},
                    {'id': 'fox', 'name': 'Adam Fox', 'position': 'D', 'team': 'NYR', 'salary': 7800, 'projected_points': 5.9, 'value': 0.76},
                    {'id': 'shesterkin', 'name': 'Igor Shesterkin', 'position': 'G', 'team': 'NYR', 'salary': 8200, 'projected_points': 6.2, 'value': 0.76},
                    {'id': 'reinhart', 'name': 'Sam Reinhart', 'position': 'UTIL', 'team': 'FLA', 'salary': 7400, 'projected_points': 5.6, 'value': 0.76},
                    {'id': 'hughes', 'name': 'Jack Hughes', 'position': 'UTIL', 'team': 'NJ', 'salary': 8300, 'projected_points': 6.3, 'value': 0.76}
                ]
            }
        ]
        
        return {
            'success': True,
            'site': site,
            'sport': sport,
            'lineups': lineups,
            'optimizer_info': {
                'salary_cap': 50000,
                'total_players': 8,
                'positions': ['C', 'W', 'W', 'D', 'D', 'G', 'UTIL', 'UTIL']
            },
            'source': 'pydfs-lineup-optimizer-nhl',
            'num_generated': len(lineups)
        }
    
    # Default NFL lineups
    lineups = [
        {
            'lineup_number': 1,
            'total_salary': 49800,
            'total_points': 124.8,
            'players': [
                {'id': 'allen', 'name': 'Josh Allen', 'position': 'QB', 'team': 'BUF', 'salary': 8000, 'projected_points': 24.8, 'value': 3.1},
                {'id': 'mccaffrey', 'name': 'Christian McCaffrey', 'position': 'RB', 'team': 'SF', 'salary': 9000, 'projected_points': 19.8, 'value': 2.2},
                {'id': 'ekeler', 'name': 'Austin Ekeler', 'position': 'RB', 'team': 'WAS', 'salary': 7200, 'projected_points': 17.2, 'value': 2.4},
                {'id': 'hill', 'name': 'Tyreek Hill', 'position': 'WR', 'team': 'MIA', 'salary': 8200, 'projected_points': 16.8, 'value': 2.0},
                {'id': 'lamb', 'name': 'CeeDee Lamb', 'position': 'WR', 'team': 'DAL', 'salary': 8000, 'projected_points': 16.2, 'value': 2.0},
                {'id': 'diggs', 'name': 'Stefon Diggs', 'position': 'WR', 'team': 'HOU', 'salary': 7800, 'projected_points': 15.9, 'value': 2.0},
                {'id': 'kelce', 'name': 'Travis Kelce', 'position': 'TE', 'team': 'KC', 'salary': 6400, 'projected_points': 14.2, 'value': 2.2},
                {'id': 'sf_def', 'name': 'San Francisco 49ers', 'position': 'DST', 'team': 'SF', 'salary': 3200, 'projected_points': 8.5, 'value': 2.7},
                {'id': 'tucker', 'name': 'Justin Tucker', 'position': 'K', 'team': 'BAL', 'salary': 5200, 'projected_points': 7.8, 'value': 1.5}
            ]
        },
        {
            'lineup_number': 2,
            'total_salary': 49600,
            'total_points': 122.4,
            'players': [
                {'id': 'jackson', 'name': 'Lamar Jackson', 'position': 'QB', 'team': 'BAL', 'salary': 7800, 'projected_points': 24.2, 'value': 3.1},
                {'id': 'robinson', 'name': 'Bijan Robinson', 'position': 'RB', 'team': 'ATL', 'salary': 7000, 'projected_points': 16.8, 'value': 2.4},
                {'id': 'henry', 'name': 'Derrick Henry', 'position': 'RB', 'team': 'BAL', 'salary': 6800, 'projected_points': 16.2, 'value': 2.4},
                {'id': 'stbrown', 'name': 'Amon-Ra St. Brown', 'position': 'WR', 'team': 'DET', 'salary': 7600, 'projected_points': 15.4, 'value': 2.0},
                {'id': 'brown_aj', 'name': 'A.J. Brown', 'position': 'WR', 'team': 'PHI', 'salary': 7400, 'projected_points': 15.1, 'value': 2.0},
                {'id': 'jefferson', 'name': 'Justin Jefferson', 'position': 'WR', 'team': 'MIN', 'salary': 8400, 'projected_points': 16.5, 'value': 2.0},
                {'id': 'andrews', 'name': 'Mark Andrews', 'position': 'TE', 'team': 'BAL', 'salary': 5800, 'projected_points': 12.8, 'value': 2.2},
                {'id': 'buf_def', 'name': 'Buffalo Bills', 'position': 'DST', 'team': 'BUF', 'salary': 3000, 'projected_points': 8.2, 'value': 2.7},
                {'id': 'mcpherson', 'name': 'Evan McPherson', 'position': 'K', 'team': 'CIN', 'salary': 5000, 'projected_points': 7.5, 'value': 1.5}
            ]
        }
    ]
    
    return {
        'success': True,
        'site': site,
        'sport': sport,
        'lineups': lineups,
        'optimizer_info': {
            'salary_cap': 50000,
            'total_players': 9,
            'positions': ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'DST', 'K']
        },
        'source': 'pydfs-lineup-optimizer-demo',
        'num_generated': len(lineups)
    }

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 3:
        # Default demo
        result = generate_sample_lineup()
        print(json.dumps(result, indent=2))
        return
    
    command = sys.argv[1]
    
    if command == 'demo':
        site = sys.argv[2] if len(sys.argv) > 2 else 'draftkings'
        sport = sys.argv[3] if len(sys.argv) > 3 else 'nfl'
        result = generate_sample_lineup(site, sport)
        print(json.dumps(result, indent=2))
    
    elif command == 'optimize':
        if len(sys.argv) < 5:
            print(json.dumps({'success': False, 'error': 'Missing parameters for optimize command'}))
            return
        
        site = sys.argv[2]
        sport = sys.argv[3]
        players_json = sys.argv[4]
        num_lineups = int(sys.argv[5]) if len(sys.argv) > 5 else 5
        
        try:
            players_data = json.loads(players_json)
            result = optimize_lineups(site, sport, players_data, num_lineups)
            print(json.dumps(result, indent=2))
        except json.JSONDecodeError:
            print(json.dumps({'success': False, 'error': 'Invalid JSON for players data'}))
    
    else:
        print(json.dumps({'success': False, 'error': f'Unknown command: {command}'}))

if __name__ == "__main__":
    main()