using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("system_config")]
    public class SystemConfig
        {
            public int SystemId { get; set; }

            public string ConfigKey { get; set; } = null!;

            public string? ConfigValue { get; set; }

            public string ValueType { get; set; } = "string";

            public string? Description { get; set; }

            public bool IsActive { get; set; } = true;

            public DateTime CreatedAt { get; set; }

            public string? CreatedBy { get; set; }

            public DateTime? UpdatedAt { get; set; }

            public string? UpdatedBy { get; set; }
        }
    
}
