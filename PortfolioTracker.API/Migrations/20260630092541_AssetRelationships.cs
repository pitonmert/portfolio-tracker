using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PortfolioTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class AssetRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCustom",
                table: "Assets",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AlterColumn<string>(
                name: "Symbol",
                table: "Assets",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(40)",
                oldMaxLength: 40
            );

            migrationBuilder.AlterColumn<string>(
                name: "ProviderSymbol",
                table: "Assets",
                type: "character varying(140)",
                maxLength: 140,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(80)",
                oldMaxLength: 80
            );

            migrationBuilder.AddColumn<int>(
                name: "AssetId",
                table: "Transactions",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "AssetId",
                table: "MarketPrices",
                type: "integer",
                nullable: true
            );

            migrationBuilder.Sql(
                """
                WITH symbols AS (
                    SELECT DISTINCT upper(trim("Symbol")) AS "Symbol"
                    FROM "Transactions"
                    WHERE "Symbol" IS NOT NULL AND trim("Symbol") <> ''
                    UNION
                    SELECT DISTINCT upper(trim("Symbol")) AS "Symbol"
                    FROM "MarketPrices"
                    WHERE "Symbol" IS NOT NULL AND trim("Symbol") <> ''
                ),
                missing AS (
                    SELECT symbols."Symbol"
                    FROM symbols
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM "Assets" assets
                        WHERE assets."Symbol" = symbols."Symbol"
                    )
                )
                INSERT INTO "Assets" (
                    "Symbol",
                    "Name",
                    "AssetType",
                    "Market",
                    "Currency",
                    "ProviderSymbol",
                    "Source",
                    "FundType",
                    "RawType",
                    "IsCustom",
                    "IsActive",
                    "LastSyncedAt"
                )
                SELECT
                    missing."Symbol",
                    missing."Symbol",
                    'custom',
                    'MANUAL',
                    'TRY',
                    missing."Symbol",
                    'manual',
                    NULL,
                    NULL,
                    TRUE,
                    TRUE,
                    NOW()
                FROM missing;
                """
            );

            migrationBuilder.Sql(
                """
                WITH ranked_assets AS (
                    SELECT
                        "Id",
                        "Symbol",
                        row_number() OVER (
                            PARTITION BY "Symbol"
                            ORDER BY
                                "IsActive" DESC,
                                "IsCustom" ASC,
                                CASE
                                    WHEN "AssetType" = 'fund' AND length("Symbol") = 3 THEN 0
                                    WHEN "AssetType" = 'stock' AND length("Symbol") <> 3 THEN 0
                                    ELSE 1
                                END,
                                "Id"
                        ) AS rank
                    FROM "Assets"
                )
                UPDATE "Transactions" transactions
                SET "AssetId" = ranked_assets."Id"
                FROM ranked_assets
                WHERE ranked_assets.rank = 1
                    AND ranked_assets."Symbol" = upper(trim(transactions."Symbol"));
                """
            );

            migrationBuilder.Sql(
                """
                WITH ranked_assets AS (
                    SELECT
                        "Id",
                        "Symbol",
                        row_number() OVER (
                            PARTITION BY "Symbol"
                            ORDER BY
                                "IsActive" DESC,
                                "IsCustom" ASC,
                                CASE
                                    WHEN "AssetType" = 'fund' AND length("Symbol") = 3 THEN 0
                                    WHEN "AssetType" = 'stock' AND length("Symbol") <> 3 THEN 0
                                    ELSE 1
                                END,
                                "Id"
                        ) AS rank
                    FROM "Assets"
                )
                UPDATE "MarketPrices" prices
                SET "AssetId" = ranked_assets."Id"
                FROM ranked_assets
                WHERE ranked_assets.rank = 1
                    AND ranked_assets."Symbol" = upper(trim(prices."Symbol"));
                """
            );

            migrationBuilder.AlterColumn<int>(
                name: "AssetId",
                table: "Transactions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<int>(
                name: "AssetId",
                table: "MarketPrices",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.DropPrimaryKey(name: "PK_MarketPrices", table: "MarketPrices");

            migrationBuilder.DropColumn(name: "Symbol", table: "Transactions");

            migrationBuilder.DropColumn(name: "CompanyName", table: "MarketPrices");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MarketPrices",
                table: "MarketPrices",
                column: "AssetId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_AssetId",
                table: "Transactions",
                column: "AssetId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_MarketPrices_Symbol",
                table: "MarketPrices",
                column: "Symbol"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_MarketPrices_Assets_AssetId",
                table: "MarketPrices",
                column: "AssetId",
                principalTable: "Assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Assets_AssetId",
                table: "Transactions",
                column: "AssetId",
                principalTable: "Assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MarketPrices_Assets_AssetId",
                table: "MarketPrices"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Assets_AssetId",
                table: "Transactions"
            );

            migrationBuilder.DropIndex(name: "IX_Transactions_AssetId", table: "Transactions");

            migrationBuilder.DropPrimaryKey(name: "PK_MarketPrices", table: "MarketPrices");

            migrationBuilder.DropIndex(name: "IX_MarketPrices_Symbol", table: "MarketPrices");

            migrationBuilder.AddColumn<string>(
                name: "Symbol",
                table: "Transactions",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "MarketPrices",
                type: "character varying(240)",
                maxLength: 240,
                nullable: true
            );

            migrationBuilder.Sql(
                """
                UPDATE "Transactions" transactions
                SET "Symbol" = assets."Symbol"
                FROM "Assets" assets
                WHERE transactions."AssetId" = assets."Id";
                """
            );

            migrationBuilder.Sql(
                """
                UPDATE "MarketPrices" prices
                SET "CompanyName" = assets."Name"
                FROM "Assets" assets
                WHERE prices."AssetId" = assets."Id";
                """
            );

            migrationBuilder.AlterColumn<string>(
                name: "Symbol",
                table: "Transactions",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true
            );

            migrationBuilder.DropColumn(name: "AssetId", table: "Transactions");

            migrationBuilder.DropColumn(name: "AssetId", table: "MarketPrices");

            migrationBuilder.AlterColumn<string>(
                name: "Symbol",
                table: "Assets",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(120)",
                oldMaxLength: 120
            );

            migrationBuilder.AlterColumn<string>(
                name: "ProviderSymbol",
                table: "Assets",
                type: "character varying(80)",
                maxLength: 80,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(140)",
                oldMaxLength: 140
            );

            migrationBuilder.DropColumn(name: "IsCustom", table: "Assets");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MarketPrices",
                table: "MarketPrices",
                column: "Symbol"
            );
        }
    }
}
