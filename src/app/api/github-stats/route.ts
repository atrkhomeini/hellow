import { NextResponse } from "next/server";

// Cache the response for 1 hour (3600 seconds)
export const revalidate = 3600;

interface GitHubUser {
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  name: string;
  bio: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  description: string;
  updated_at: string;
}

interface GitHubStats {
  username: string;
  avatarUrl: string;
  name: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  languages: string[];
  languageCount: number;
  topRepos: {
    name: string;
    description: string;
    stars: number;
    language: string;
    url: string;
  }[];
}

async function fetchGitHubStats(username: string): Promise<GitHubStats | null> {
  try {
    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        // Optional: Add GitHub token for higher rate limits
        // "Authorization": `token ${process.env.GITHUB_TOKEN}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub user fetch failed: ${userResponse.status}`);
    }

    const userData: GitHubUser = await userResponse.json();

    // Fetch repositories (paginated, get first 100)
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      {
        headers: {
          "Accept": "application/vnd.github.v3+json",
          // "Authorization": `token ${process.env.GITHUB_TOKEN}`,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!reposResponse.ok) {
      throw new Error(`GitHub repos fetch failed: ${reposResponse.status}`);
    }

    const reposData: GitHubRepo[] = await reposResponse.json();

    // Calculate stats
    const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = reposData.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    // Get unique languages (filter out null)
    const languages = [...new Set(reposData.map((repo) => repo.language).filter(Boolean))] as string[];
    
    // Get top 6 repos by stars
    const topRepos = reposData
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map((repo) => ({
        name: repo.name,
        description: repo.description || "No description",
        stars: repo.stargazers_count,
        language: repo.language || "Unknown",
        url: repo.html_url,
      }));

    return {
      username,
      avatarUrl: userData.avatar_url,
      name: userData.name || username,
      bio: userData.bio || "",
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      totalStars,
      totalForks,
      languages,
      languageCount: languages.length,
      topRepos,
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "GitHub username is required" },
      { status: 400 }
    );
  }

  const stats = await fetchGitHubStats(username);

  if (!stats) {
    return NextResponse.json(
      { error: "Failed to fetch GitHub stats" },
      { status: 500 }
    );
  }

  return NextResponse.json(stats);
}