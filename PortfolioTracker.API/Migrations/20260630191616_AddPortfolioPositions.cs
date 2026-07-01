using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PortfolioTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPortfolioPositions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PortfolioPositions",
                columns: table => new
                {
                    AssetId = table.Column<int>(type: "integer", nullable: false),
                    Symbol = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Market = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    NetQuantity = table.Column<decimal>(type: "numeric", nullable: false),
                    AverageCost = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalInvested = table.Column<decimal>(type: "numeric", nullable: false),
                    RealizedPnL = table.Column<decimal>(type: "numeric", nullable: false),
                    ActivePositionCost = table.Column<decimal>(type: "numeric", nullable: false),
                    CurrentPrice = table.Column<decimal>(type: "numeric", nullable: true),
                    MarketValue = table.Column<decimal>(type: "numeric", nullable: false),
                    UnrealizedPnL = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalPnL = table.Column<decimal>(type: "numeric", nullable: false),
                    PnLPercent = table.Column<decimal>(type: "numeric", nullable: true),
                    IsClosed = table.Column<bool>(type: "boolean", nullable: false),
                    LastTransactionAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PriceUpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CalculatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortfolioPositions", x => x.AssetId);
                    table.ForeignKey(
                        name: "FK_PortfolioPositions_Assets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioPositions_Market",
                table: "PortfolioPositions",
                column: "Market");

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioPositions_Symbol",
                table: "PortfolioPositions",
                column: "Symbol");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PortfolioPositions");
        }
    }
}
