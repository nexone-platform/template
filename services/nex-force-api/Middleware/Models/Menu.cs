using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("menus", Schema = "nex_core")]
    public class Menu
    {
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }

        public long MenuId { get; set; }
        public string? Title { get; set; }
        public string? Icon { get; set; }
        public string? MenuValue { get; set; }
        public string? Route { get; set; }
        public string? Base { get; set; }
        public string? AppName { get; set; }

        // Foreign Key relation for parent menu
        public int? ParentId { get; set; }
        public bool IsActive { get; set; }
        public Menu? ParentMenu { get; set; }

        public string? MenuCode { get; set; }
        public string? PageKey { get; set; }
        public int? MenuSeq { get; set; }


        // ฟิลด์ที่ใช้ในระหว่างการประมวลผลเท่านั้น
        [JsonIgnore]  // ใช้เพื่อละการ serializing field นี้
        public List<Menu> SubMenus { get; set; }  // เมนูที่เป็นลูก
        [JsonIgnore]
        public List<Menu> SubSubMenus { get; set; } // เมนูที่เป็นลูกย่อย
    }
}
