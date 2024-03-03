public class Script : ScriptBase
{
  public override async Task<HttpResponseMessage> ExecuteAsync()

	{
		HttpResponseMessage response = await this.Context.SendAsync(this.Context.Request, this.CancellationToken).ConfigureAwait(false);
		if (response.StatusCode == HttpStatusCode.Found)
		{
			if (response.Headers.Location != null)
			{
				var redirectUrl = response.Headers.Location.ToString();
				var redirectRequest = new HttpRequestMessage(HttpMethod.Get, redirectUrl);
				response = await this.Context.SendAsync(redirectRequest, this.CancellationToken).ConfigureAwait(true);
			}
			else
			{
				// If the Location header is not present, return an error response
				response = new HttpResponseMessage(HttpStatusCode.BadRequest);
				response.Content = CreateJsonContent("Location header missing in the redirect response.");
			}
		}
		else if (response.IsSuccessStatusCode)
		{

			var responseString = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
			var result = JObject.Parse(responseString);
			var newResult = new JObject
			{
				["wrapped"] = result,
			};     
			response.Content = CreateJsonContent(newResult.ToString());
		}
		return response;
	}
}
