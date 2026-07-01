using System.Net;

namespace PortfolioTracker.API.IntegrationTests;

public class HealthEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_WhenDatabaseIsAvailable_ReturnsHealthy()
    {
        var response = await _client.GetAsync("/health");
        var content = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("\"status\":\"healthy\"", content);
        Assert.Contains("\"database\":\"healthy\"", content);
    }
}
