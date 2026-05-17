using System.Security.Claims;
using ForgeHub.API.Data;
using ForgeHub.API.DTOs;
using ForgeHub.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ForgeHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly MemberExperienceService _memberExperienceService;

    public StatsController(ApplicationDbContext context, MemberExperienceService memberExperienceService)
    {
        _context = context;
        _memberExperienceService = memberExperienceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetStats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!long.TryParse(userId, out var parsedUserId))
        {
            return Unauthorized();
        }

        var member = await _context.Members.FirstOrDefaultAsync(m => m.UserId == parsedUserId);
        var memberId = member?.Id;
        var recentCheckIns = memberId.HasValue
            ? await _context.CheckIns
                .Where(item => item.MemberId == memberId.Value)
                .OrderByDescending(item => item.CheckInTime)
                .Take(31)
                .ToListAsync()
            : [];

        var weeklyAttendance = Enumerable.Range(0, 7)
            .Select(offset =>
            {
                var day = DateTime.UtcNow.Date.AddDays(-6 + offset);
                return recentCheckIns.Count(checkIn => checkIn.CheckInTime?.Date == day);
            })
            .ToList();

        var monthlyAttendance = Enumerable.Range(0, 4)
            .Select(offset =>
            {
                var month = DateTime.UtcNow.AddMonths(-3 + offset);
                return recentCheckIns.Count(checkIn =>
                    checkIn.CheckInTime.HasValue &&
                    checkIn.CheckInTime.Value.Month == month.Month &&
                    checkIn.CheckInTime.Value.Year == month.Year);
            })
            .ToList();

        var workouts = await _memberExperienceService.GetWorkoutsAsync(parsedUserId);
        var workoutFrequency = workouts.Count(record => record.CompletedAt >= DateTime.UtcNow.AddDays(-7));
        var calories = workouts.Sum(record => Math.Max(120, record.DurationSeconds / 6));

        return Ok(new StatsResponseDto
        {
            WeeklyAttendance = weeklyAttendance,
            MonthlyAttendance = monthlyAttendance,
            WorkoutFrequency = workoutFrequency,
            TotalCheckIns = recentCheckIns.Count,
            CaloriesBurnedEstimate = calories
        });
    }
}
