using BCrypt.Net;
using ForgeHub.API.Data;
using ForgeHub.API.DTOs;
using ForgeHub.API.Helpers;
using ForgeHub.API.Models;
using ForgeHub.API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ForgeHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UsersController(ApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] long? gymId, [FromQuery] long? branchId, [FromQuery] long? roleId)
    {
        var query = ApplyScope(_context.Users.Include(u => u.Role).AsQueryable());

        if (gymId.HasValue)
        {
            query = query.Where(u => u.GymId == gymId.Value);
        }

        if (branchId.HasValue)
        {
            query = query.Where(u => u.BranchId == branchId.Value);
        }

        if (roleId.HasValue)
        {
            query = query.Where(u => u.RoleId == roleId.Value);
        }

        var users = await query.OrderBy(u => u.FullName).ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetUser(long id)
    {
        var user = await ApplyScope(_context.Users.Include(u => u.Role).AsQueryable()).FirstOrDefaultAsync(u => u.Id == id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.AdminRoles)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email already exists." });
            }

            var roleExists = await _context.Roles.AnyAsync(r => r.Id == request.RoleId);
            if (!roleExists)
            {
                return BadRequest(new { message = "Role not found." });
            }

            var scopedGymId = _currentUser.IsInRole(AppRoles.SuperAdmin) ? request.GymId : _currentUser.GymId;
            var scopedBranchId = _currentUser.IsInRole(AppRoles.GymOwner) || _currentUser.IsInRole(AppRoles.SuperAdmin)
                ? request.BranchId
                : _currentUser.BranchId;

            var user = new User
            {
                GymId = scopedGymId,
                BranchId = scopedBranchId,
                RoleId = request.RoleId,
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.ToDetailedMessage() });
        }
    }

    [HttpPut("{id:long}")]
    [Authorize(Roles = AppRoles.AdminRoles)]
    public async Task<IActionResult> UpdateUser(long id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            var user = await ApplyScope(_context.Users.AsQueryable()).FirstOrDefaultAsync(item => item.Id == id);
            if (user == null)
            {
                return NotFound();
            }

            var emailInUse = await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != id);
            if (emailInUse)
            {
                return BadRequest(new { message = "Email already exists." });
            }

            user.GymId = _currentUser.IsInRole(AppRoles.SuperAdmin) ? request.GymId : user.GymId;
            user.BranchId = _currentUser.IsInRole(AppRoles.GymOwner) || _currentUser.IsInRole(AppRoles.SuperAdmin)
                ? request.BranchId
                : user.BranchId;
            user.RoleId = request.RoleId;
            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Phone = request.Phone;
            user.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.ToDetailedMessage() });
        }
    }

    [HttpDelete("{id:long}")]
    [Authorize(Roles = AppRoles.OwnerRoles)]
    public async Task<IActionResult> DeleteUser(long id)
    {
        try
        {
            var user = await ApplyScope(_context.Users.AsQueryable()).FirstOrDefaultAsync(item => item.Id == id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.ToDetailedMessage() });
        }
    }

    private IQueryable<User> ApplyScope(IQueryable<User> query)
    {
        if (_currentUser.IsInRole(AppRoles.SuperAdmin))
        {
            return query;
        }

        if (_currentUser.GymId.HasValue)
        {
            query = query.Where(item => item.GymId == _currentUser.GymId.Value);
        }

        if (_currentUser.BranchId.HasValue &&
            (_currentUser.IsInRole(AppRoles.BranchManager) || _currentUser.IsInRole(AppRoles.Staff) || _currentUser.IsInRole(AppRoles.Trainer)))
        {
            query = query.Where(item => item.BranchId == _currentUser.BranchId.Value || item.BranchId == null);
        }

        return query;
    }
}
