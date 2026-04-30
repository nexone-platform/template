using Azure.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Middleware.Data;
using Middlewares;
using System;
using System.Security.Claims;
/*using JasperServer.Client;
using JasperServer.Client.Core;*/

namespace HrService.Services
{
    public class JasperReportService
    {
   /*     private readonly JasperserverRestClient _client;*/

        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public JasperReportService(string baseUrl, string username, string password)
        {
        /*    _client = new JasperserverRestClient(baseUrl, username, password);*/
        }

/*        public void DownloadReportToFile(string reportPath, Dictionary<string, string> parameters, string outputPath)
        {
            // เรียก SaveToFile ที่มี parameters (เป็น method blocking/sync)
            _client.SaveToFile(reportPath, parameters, outputPath);
        }*/

    }
}
