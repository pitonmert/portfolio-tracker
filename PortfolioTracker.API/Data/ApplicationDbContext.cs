using PortfolioTracker.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace PortfolioTracker.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Transaction> Transactions { get; set; }

    public DbSet<MarketPrice> MarketPrices { get; set; }

    public DbSet<PortfolioSettings> PortfolioSettings { get; set; }
}
