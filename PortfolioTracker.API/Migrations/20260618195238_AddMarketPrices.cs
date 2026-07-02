using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PortfolioTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMarketPrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MarketPrices",
                columns: table => new
                {
                    Symbol = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: false
                    ),
                    ProviderSymbol = table.Column<string>(
                        type: "character varying(140)",
                        maxLength: 140,
                        nullable: false
                    ),
                    CompanyName = table.Column<string>(
                        type: "character varying(240)",
                        maxLength: 240,
                        nullable: true
                    ),
                    CurrentPrice = table.Column<decimal>(type: "numeric", nullable: true),
                    DayHigh = table.Column<decimal>(type: "numeric", nullable: true),
                    DayLow = table.Column<decimal>(type: "numeric", nullable: true),
                    MarketCap = table.Column<decimal>(type: "numeric", nullable: true),
                    FetchedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    Error = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketPrices", x => x.Symbol);
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "MarketPrices");
        }
    }
}
