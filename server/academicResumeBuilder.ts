// Academic Resume Builder Service - Professional Student Achievement Portfolios
// Creates comprehensive academic resumes from competition data for college applications

import { getStorage } from "./storage";
import { CrossDashboardAccessService } from "./crossDashboardAccess";

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  targetAudience: string[];
  sections: ResumeSection[];
}

export interface ResumeSection {
  id: string;
  title: string;
  type:
    | "achievements"
    | "leadership"
    | "academics"
    | "athletics"
    | "personal"
    | "skills";
  required: boolean;
  customizable: boolean;
}

export interface GeneratedResume {
  studentId: string;
  templateId: string;
  sections: GeneratedSection[];
  metadata: {
    generatedAt: Date;
    platformVerification: string;
    totalAchievements: number;
    competitiveExperience: string;
  };
}

export interface GeneratedSection {
  title: string;
  content: any[];
  formatting: {
    style: "list" | "paragraph" | "timeline" | "grid";
    emphasis: "achievements" | "leadership" | "consistency";
  };
}

export class AcademicResumeBuilderService {
  private crossDashboardService: CrossDashboardAccessService;

  constructor() {
    this.crossDashboardService = new CrossDashboardAccessService();
  }

  // ===============================
  // RESUME TEMPLATES
  // ===============================

  getResumeTemplates(): ResumeTemplate[] {
    return [
      {
        id: "college_application",
        name: "College Application Resume",
        description:
          "Comprehensive resume highlighting academic achievements, leadership, and well-rounded development",
        targetAudience: [
          "college_admissions",
          "scholarship_applications",
          "honors_programs",
        ],
        sections: [
          {
            id: "academic_achievements",
            title: "Academic Competition Achievements",
            type: "achievements",
            required: true,
            customizable: false,
          },
          {
            id: "leadership_roles",
            title: "Leadership & Character",
            type: "leadership",
            required: true,
            customizable: false,
          },
          {
            id: "athletic_participation",
            title: "Athletic Participation",
            type: "athletics",
            required: false,
            customizable: true,
          },
          {
            id: "advancement_history",
            title: "Competition Advancement History",
            type: "achievements",
            required: true,
            customizable: false,
          },
          {
            id: "academic_strengths",
            title: "Academic Strengths & Subjects",
            type: "academics",
            required: true,
            customizable: false,
          },
          {
            id: "personal_statement",
            title: "Personal Statement",
            type: "personal",
            required: false,
            customizable: true,
          },
        ],
      },
      {
        id: "scholarship_focused",
        name: "Scholarship Application Resume",
        description:
          "Achievement-focused resume emphasizing academic excellence and competitive success",
        targetAudience: [
          "academic_scholarships",
          "merit_awards",
          "competition_recognition",
        ],
        sections: [
          {
            id: "top_achievements",
            title: "Top Academic Achievements",
            type: "achievements",
            required: true,
            customizable: false,
          },
          {
            id: "advancement_summary",
            title: "District/Regional/State Advancement",
            type: "achievements",
            required: true,
            customizable: false,
          },
          {
            id: "subject_expertise",
            title: "Subject Area Expertise",
            type: "academics",
            required: true,
            customizable: false,
          },
          {
            id: "consistency_record",
            title: "Consistent Performance Record",
            type: "achievements",
            required: true,
            customizable: false,
          },
          {
            id: "skills_summary",
            title: "Academic & Technical Skills",
            type: "skills",
            required: false,
            customizable: true,
          },
        ],
      },
      {
        id: "leadership_emphasis",
        name: "Leadership-Focused Resume",
        description:
          "Highlights leadership roles, team participation, and character development",
        targetAudience: [
          "leadership_scholarships",
          "student_government",
          "honor_societies",
        ],
        sections: [
          {
            id: "leadership_positions",
            title: "Leadership Positions",
            type: "leadership",
            required: true,
            customizable: false,
          },
          {
            id: "team_achievements",
            title: "Team-Based Achievements",
            type: "achievements",
            required: true,
            customizable: false,
          },
          {
            id: "mentorship_roles",
            title: "Mentorship & Coaching",
            type: "leadership",
            required: false,
            customizable: true,
          },
          {
            id: "character_development",
            title: "Character & Service",
            type: "personal",
            required: false,
            customizable: true,
          },
          {
            id: "collaborative_success",
            title: "Collaborative Success Stories",
            type: "achievements",
            required: true,
            customizable: false,
          },
        ],
      },
      {
        id: "well_rounded",
        name: "Well-Rounded Student Resume",
        description:
          "Balanced presentation of academic, athletic, and personal achievements",
        targetAudience: [
          "general_college_applications",
          "well_rounded_scholarships",
          "honors_programs",
        ],
        sections: [
          {
            id: "academic_overview",
            title: "Academic Competition Overview",
            type: "academics",
            required: true,
            customizable: false,
          },
          {
            id: "athletic_overview",
            title: "Athletic Participation Overview",
            type: "athletics",
            required: true,
            customizable: false,
          },
          {
            id: "leadership_summary",
            title: "Leadership & Service Summary",
            type: "leadership",
            required: true,
            customizable: false,
          },
          {
            id: "achievement_timeline",
            title: "Achievement Timeline",
            type: "achievements",
            required: true,
            customizable: false,
          },
          {
            id: "well_rounded_score",
            title: "Development Profile",
            type: "personal",
            required: true,
            customizable: false,
          },
        ],
      },
    ];
  }

  // ===============================
  // RESUME GENERATION
  // ===============================

  async generateResume(
    studentId: string,
    templateId: string,
    customizations?: any,
  ): Promise<GeneratedResume> {
    const template = this.getResumeTemplates().find((t) => t.id === templateId);
    if (!template) {
      throw new Error(`Resume template not found: ${templateId}`);
    }

    // Get comprehensive student achievement profile
    const achievementProfile =
      await this.crossDashboardService.buildStudentAchievementProfile(
        studentId,
      );

    const generatedSections: GeneratedSection[] = [];

    for (const section of template.sections) {
      const generatedSection = await this.generateSection(
        section,
        achievementProfile,
        customizations,
      );
      if (generatedSection) {
        generatedSections.push(generatedSection);
      }
    }

    return {
      studentId,
      templateId,
      sections: generatedSections,
      metadata: {
        generatedAt: new Date(),
        platformVerification:
          "Champions for Change Tournament Platform - Verified Achievement Data",
        totalAchievements:
          achievementProfile.academics.achievements.length +
          achievementProfile.athletics.achievements.length,
        competitiveExperience:
          this.summarizeCompetitiveExperience(achievementProfile),
      },
    };
  }

  private async generateSection(
    section: ResumeSection,
    profile: any,
    customizations?: any,
  ): Promise<GeneratedSection | null> {
    switch (section.id) {
      case "academic_achievements":
        return this.generateAcademicAchievementsSection(profile);

      case "leadership_roles":
        return this.generateLeadershipSection(profile);

      case "athletic_participation":
        return this.generateAthleticSection(profile);

      case "advancement_history":
        return this.generateAdvancementHistorySection(profile);

      case "academic_strengths":
        return this.generateAcademicStrengthsSection(profile);

      case "top_achievements":
        return this.generateTopAchievementsSection(profile);

      case "subject_expertise":
        return this.generateAcademicStrengthsSection(profile);

      case "consistency_record":
        return this.generateTopAchievementsSection(profile);

      case "leadership_positions":
        return this.generateLeadershipSection(profile);

      case "team_achievements":
        return this.generateTopAchievementsSection(profile);

      case "achievement_timeline":
        return this.generateTimelineSection(profile);

      case "well_rounded_score":
        return this.generateWellRoundedSection(profile);

      default:
        return null;
    }
  }

  // ===============================
  // SECTION GENERATORS
  // ===============================

  private generateAcademicAchievementsSection(profile: any): GeneratedSection {
    const achievements = profile.academics.achievements
      .sort((a, b) => a.placement - b.placement)
      .slice(0, 15);

    const content = achievements.map((achievement) => ({
      competition: achievement.competition,
      category: achievement.category,
      placement: this.formatPlacement(achievement.placement),
      medal: achievement.medal,
      advancement: achievement.advances
        ? `Advanced to ${achievement.advancementLevel}`
        : null,
      date: this.formatDate(achievement.date),
      significance: this.assessAchievementSignificance(achievement),
    }));

    return {
      title: "Academic Competition Achievements",
      content,
      formatting: {
        style: "list",
        emphasis: "achievements",
      },
    };
  }

  private generateLeadershipSection(profile: any): GeneratedSection {
    const leadership = profile.collegeProfile.leadershipRoles || [];

    const content = leadership.map((role) => ({
      position: role.role,
      organization: role.activity,
      type: role.type,
      duration: role.duration,
      impact: this.describeLeadershipImpact(role),
    }));

    // Add implied leadership from team participation
    profile.academics.achievements
      .filter((a) => a.type === "academic" && a.teamEvent)
      .forEach((teamEvent) => {
        content.push({
          position: "Team Participant",
          organization: `${teamEvent.competition} Team`,
          type: "academic",
          duration: "Competition Season",
          impact: "Collaborative academic competition experience",
        });
      });

    return {
      title: "Leadership & Character Development",
      content,
      formatting: {
        style: "list",
        emphasis: "leadership",
      },
    };
  }

  private generateAthleticSection(profile: any): GeneratedSection | null {
    if (profile.athletics.achievements.length === 0) {
      return null;
    }

    const content = profile.athletics.sports.map((sport) => {
      const sportAchievements = profile.athletics.achievements.filter(
        (a) => a.sport === sport,
      );
      const bestPlacement = Math.min(
        ...sportAchievements.map((a) => a.placement || 999),
      );

      return {
        sport: sport,
        participation: `${sportAchievements.length} competitive events`,
        bestResult:
          bestPlacement < 999
            ? this.formatPlacement(bestPlacement)
            : "Participated",
        development:
          "Athletic participation demonstrating commitment and teamwork",
      };
    });

    return {
      title: "Athletic Participation",
      content,
      formatting: {
        style: "list",
        emphasis: "consistency",
      },
    };
  }

  private generateAdvancementHistorySection(profile: any): GeneratedSection {
    const advancements = profile.academics.advancementHistory || [];

    const content = advancements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((advancement) => ({
        competition: advancement.competition,
        category: advancement.category,
        level: advancement.advancementLevel,
        placement: this.formatPlacement(advancement.placement),
        date: this.formatDate(advancement.date),
        significance: this.getAdvancementSignificance(
          advancement.advancementLevel,
        ),
      }));

    return {
      title: "Competition Advancement History",
      content,
      formatting: {
        style: "timeline",
        emphasis: "achievements",
      },
    };
  }

  private generateAcademicStrengthsSection(profile: any): GeneratedSection {
    const strengths = profile.collegeProfile.academicStrengths || [];

    const content = strengths.map((strength) => ({
      subject: this.formatSubjectName(strength.subject),
      competitionCount: strength.totalCompetitions,
      averagePerformance: this.formatPlacement(
        Math.round(strength.averagePlacement),
      ),
      bestResult: this.formatPlacement(strength.bestPlacement),
      expertise: this.describeSubjectExpertise(strength),
    }));

    return {
      title: "Academic Strengths & Subject Areas",
      content,
      formatting: {
        style: "grid",
        emphasis: "achievements",
      },
    };
  }

  private generateTopAchievementsSection(profile: any): GeneratedSection {
    const allAchievements = [
      ...profile.academics.topPerformances,
      ...profile.athletics.topPerformances,
    ]
      .sort((a, b) => a.placement - b.placement)
      .slice(0, 10);

    const content = allAchievements.map((achievement) => ({
      title: achievement.competition || achievement.event,
      category: achievement.category || achievement.sport,
      result: this.formatPlacement(achievement.placement),
      type: achievement.type,
      date: this.formatDate(achievement.date),
      distinction: this.getAchievementDistinction(achievement),
    }));

    return {
      title: "Top Competitive Achievements",
      content,
      formatting: {
        style: "list",
        emphasis: "achievements",
      },
    };
  }

  private generateTimelineSection(profile: any): GeneratedSection {
    const timeline = profile.timeline.slice(0, 20);

    const content = timeline.map((event) => ({
      date: this.formatDate(event.date || event.createdAt),
      achievement: event.competition || event.event || event.eventName,
      category: event.category || event.sport,
      result: this.formatPlacement(event.placement),
      type: event.type,
      significance: event.advances
        ? "Advanced to next level"
        : "Competitive participation",
    }));

    return {
      title: "Competitive Achievement Timeline",
      content,
      formatting: {
        style: "timeline",
        emphasis: "consistency",
      },
    };
  }

  private generateWellRoundedSection(profile: any): GeneratedSection {
    const score = profile.collegeProfile.wellRoundedScore || 0;
    const indicators = profile.collegeProfile.collegeReadinessIndicators || {};

    const content = [
      {
        wellRoundedScore: `${score}/100`,
        academicDiversity: indicators.academicDiversity
          ? "Demonstrated across multiple subjects"
          : "Limited subject focus",
        athleticParticipation: indicators.athleticParticipation
          ? "Multi-sport participation"
          : "Academic focus",
        leadership: indicators.leadershipDemonstration
          ? "Leadership roles demonstrated"
          : "Team participation",
        consistency: indicators.consistentPerformance
          ? "Consistent competitive performance"
          : "Developing competitor",
        advancement: `${profile.academics.advancementHistory?.length || 0} advancement achievements`,
        readinessLevel: this.calculateReadinessLevel(score, indicators),
      },
    ];

    return {
      title: "Student Development Profile",
      content,
      formatting: {
        style: "paragraph",
        emphasis: "leadership",
      },
    };
  }

  // ===============================
  // FORMATTING HELPERS
  // ===============================

  private formatPlacement(placement: number): string {
    if (placement === 1) return "1st Place";
    if (placement === 2) return "2nd Place";
    if (placement === 3) return "3rd Place";
    return `${placement}th Place`;
  }

  private formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  private formatSubjectName(subject: string): string {
    return subject
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private summarizeCompetitiveExperience(profile: any): string {
    const totalCompetitions =
      profile.academics.totalCompetitions + profile.athletics.totalSports;
    const subjects = profile.academics.subjects.length;
    const advancements = profile.academics.advancementHistory?.length || 0;

    return `${totalCompetitions} competitions across ${subjects} academic areas with ${advancements} advancement achievements`;
  }

  private assessAchievementSignificance(achievement: any): string {
    if (achievement.placement === 1 && achievement.advances)
      return "Champion with advancement";
    if (achievement.placement === 1) return "Competition champion";
    if (achievement.placement <= 3 && achievement.advances)
      return "Top performer with advancement";
    if (achievement.placement <= 3) return "Top competitive performance";
    if (achievement.advances) return "Advanced to next level";
    return "Competitive participation";
  }

  private describeLeadershipImpact(role: any): string {
    if (role.role.includes("Captain"))
      return "Team leadership and coordination";
    if (role.type === "academic") return "Academic team leadership";
    if (role.type === "athletic") return "Athletic team leadership";
    return "Leadership and mentorship role";
  }

  private getAdvancementSignificance(level: string): string {
    if (level?.toLowerCase().includes("state"))
      return "State-level qualification - top tier achievement";
    if (level?.toLowerCase().includes("regional"))
      return "Regional-level qualification - advanced achievement";
    return "District-level advancement";
  }

  private describeSubjectExpertise(strength: any): string {
    if (strength.averagePlacement <= 2)
      return "Exceptional competitive performance";
    if (strength.averagePlacement <= 5) return "Strong competitive performance";
    return "Consistent competitive participation";
  }

  private getAchievementDistinction(achievement: any): string {
    if (achievement.placement === 1) return "First Place Achievement";
    if (achievement.placement <= 3) return "Top Three Performance";
    return "Competitive Achievement";
  }

  private calculateReadinessLevel(score: number, indicators: any): string {
    if (
      score >= 80 &&
      indicators.academicDiversity &&
      indicators.leadershipDemonstration
    ) {
      return "Highly Prepared - Exceptional competitive profile";
    }
    if (score >= 60 && indicators.consistentPerformance) {
      return "Well Prepared - Strong competitive foundation";
    }
    if (score >= 40) {
      return "Developing - Building competitive experience";
    }
    return "Emerging - Early competitive development";
  }

  // ===============================
  // RESUME EXPORT FORMATS
  // ===============================

  async exportResumeAsPDF(resume: GeneratedResume): Promise<Buffer> {
    // This would integrate with a PDF generation library
    // For now, return formatted text
    throw new Error(
      "PDF export not yet implemented - would integrate with PDF generation service",
    );
  }

  exportResumeAsJSON(resume: GeneratedResume): string {
    return JSON.stringify(resume, null, 2);
  }

  exportResumeAsMarkdown(resume: GeneratedResume): string {
    let markdown = `# Academic Resume\n\n`;
    markdown += `**Generated:** ${resume.metadata.generatedAt.toLocaleDateString()}\n`;
    markdown += `**Platform Verification:** ${resume.metadata.platformVerification}\n`;
    markdown += `**Competitive Experience:** ${resume.metadata.competitiveExperience}\n\n`;

    for (const section of resume.sections) {
      markdown += `## ${section.title}\n\n`;

      if (section.formatting.style === "list") {
        section.content.forEach((item) => {
          markdown += `- **${Object.values(item)[0]}:** ${Object.values(item).slice(1).join(", ")}\n`;
        });
      } else if (section.formatting.style === "timeline") {
        section.content.forEach((item) => {
          markdown += `### ${item.date || item.title}\n${Object.entries(item)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")}\n\n`;
        });
      } else {
        section.content.forEach((item) => {
          markdown += `${Object.entries(item)
            .map(([k, v]) => `**${k}:** ${v}`)
            .join(" | ")}\n\n`;
        });
      }
      markdown += "\n";
    }

    return markdown;
  }
}
