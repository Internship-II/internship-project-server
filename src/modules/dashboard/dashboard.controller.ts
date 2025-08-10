import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto, SubjectStatsDto, ComprehensiveDashboardDto } from './dto/dashboard-stats.dto';

@Controller('dashboard')
@ApiTags('Dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully', type: DashboardStatsDto })
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('subject-stats')
  @ApiOperation({ summary: 'Get subject-wise statistics' })
  @ApiResponse({ status: 200, description: 'Subject statistics retrieved successfully', type: [SubjectStatsDto] })
  async getSubjectStats() {
    return this.dashboardService.getSubjectStats();
  }

  @Get('role-stats')
  @ApiOperation({ summary: 'Get role-based statistics' })
  @ApiResponse({ status: 200, description: 'Role-based statistics retrieved successfully' })
  async getRoleBasedStats() {
    return this.dashboardService.getRoleBasedStats();
  }

  @Get('comprehensive')
  @ApiOperation({ summary: 'Get comprehensive dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Comprehensive statistics retrieved successfully', type: ComprehensiveDashboardDto })
  async getComprehensiveStats() {
    return this.dashboardService.getComprehensiveStats();
  }
    
} 