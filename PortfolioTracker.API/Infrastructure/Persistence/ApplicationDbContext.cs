using Microsoft.EntityFrameworkCore;
using PortfolioTracker.API.Domain.Entities;

namespace PortfolioTracker.API.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Transaction> Transactions { get; set; }

    public DbSet<Asset> Assets { get; set; }

    public DbSet<MarketPrice> MarketPrices { get; set; }

    public DbSet<PortfolioSettings> PortfolioSettings { get; set; }

    public DbSet<PortfolioPositionSnapshot> PortfolioPositions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder
            .Entity<Asset>()
            .HasIndex(asset => new
            {
                asset.Symbol,
                asset.AssetType,
                asset.Market,
            })
            .IsUnique();

        modelBuilder.Entity<Asset>().HasIndex(asset => asset.Symbol);
        modelBuilder.Entity<Asset>().HasIndex(asset => asset.Name);

        modelBuilder
            .Entity<Asset>()
            .HasMany(asset => asset.Transactions)
            .WithOne(transaction => transaction.Asset)
            .HasForeignKey(transaction => transaction.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<Asset>()
            .HasOne(asset => asset.MarketPrice)
            .WithOne(price => price.Asset)
            .HasForeignKey<MarketPrice>(price => price.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MarketPrice>().HasIndex(price => price.Symbol);

        modelBuilder
            .Entity<Asset>()
            .HasOne(asset => asset.PortfolioPosition)
            .WithOne(position => position.Asset)
            .HasForeignKey<PortfolioPositionSnapshot>(position => position.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PortfolioPositionSnapshot>().ToTable("PortfolioPositions");
        modelBuilder.Entity<PortfolioPositionSnapshot>().HasIndex(position => position.Symbol);
        modelBuilder.Entity<PortfolioPositionSnapshot>().HasIndex(position => position.Market);
    }
}
