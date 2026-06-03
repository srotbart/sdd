#!/bin/bash
input=$(cat)
cwd=$(echo "$input" | jq -r '.workspace.current_dir')

# Walk up to find .sdd root (Claude Code may cd into a subdirectory)
sdd_root=""
dir="$cwd"
while [ "$dir" != "/" ]; do
    if [ -d "$dir/.sdd" ]; then
        sdd_root="$dir"
        break
    fi
    dir=$(dirname "$dir")
done

[ -z "$sdd_root" ] && exit 0

open_targets=$(grep -rl 'status: awaiting-user' "$sdd_root/.sdd/targets/" --include="*.md" 2>/dev/null | wc -l | tr -d ' ')
open_specs=$(find "$sdd_root/.sdd/specs" -name "SPEC-*.md" ! -path "*/archive/*" 2>/dev/null | wc -l | tr -d ' ')
open_gaps=$(find "$sdd_root/.sdd/gaps" -maxdepth 1 -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
open_wi=$(find "$sdd_root/.sdd/work-items" -maxdepth 1 -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

cache_file="/tmp/.sdd-hub-status-color"
cache_ttl=30
hub_color=""

if [ -f "$cache_file" ]; then
    cache_age=$(( $(date +%s) - $(stat -f %m "$cache_file" 2>/dev/null || echo 0) ))
    [ $cache_age -lt $cache_ttl ] && hub_color=$(cat "$cache_file")
fi

if [ -z "$hub_color" ]; then
    nc -z -w 1 localhost 22400 2>/dev/null && fe_up=1 || fe_up=0
    nc -z -w 1 localhost 22351 2>/dev/null && be_up=1 || be_up=0
    if [ $fe_up -eq 1 ] && [ $be_up -eq 1 ]; then
        hub_color=$'\033[0;32m'       # green: both up
    elif [ $fe_up -eq 0 ] && [ $be_up -eq 0 ]; then
        hub_color=$'\033[0;31m'       # red: both down
    else
        hub_color=$'\033[38;5;208m'   # orange: one down
    fi
    printf '%s' "$hub_color" > "$cache_file"
fi

hub_link=$'\033]8;;http://localhost:22400\033\\'
hub_link+="${hub_color}open hub ↗"
hub_link+=$'\033[0m\033]8;;\033\\'

printf "\033[2;37mSDD\033[0m \033[2;37m▸\033[0m \033[0;33m%s targets\033[0m \033[2;37m·\033[0m \033[0;33m%s specs\033[0m \033[2;37m·\033[0m \033[0;33m%s gaps\033[0m \033[2;37m·\033[0m \033[0;36m%s work items\033[0m \033[2;37m·\033[0m %s" "$open_targets" "$open_specs" "$open_gaps" "$open_wi" "$hub_link"
