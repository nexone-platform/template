using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("auth-tb-ms-menus")]
    public class Menu
    {
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }

        public int MenusId { get; set; }
        public string? Title { get; set; }
        public string? Icon { get; set; }
        public bool? ShowAsTab { get; set; }
        public bool? SeparateRoute { get; set; }
        public string? MenuValue { get; set; }
        public string? Route { get; set; }
        public bool HasSubRoute { get; set; }
        public bool ShowSubRoute { get; set; }
        public string? Base { get; set; }
        public string? Materialicons { get; set; }
        public bool Dot { get; set; } = false;
        public string? Page { get; set; }
        public string? Page1 { get; set; }
        public string? Page2 { get; set; }
        public string? Base2 { get; set; }
        public string? Base3 { get; set; }
        public string? Base4 { get; set; }
        public string? Base5 { get; set; }
        public string? Base6 { get; set; }
        public string? Base7 { get; set; }
        public string? Base8 { get; set; }

        // Foreign Key relation for parent menu
        public int? ParentId { get; set; }
        public bool IsActive { get; set; }
        public Menu? ParentMenu { get; set; }

        public string? MenuCode { get; set; }
        public string? PageKey { get; set; }
        public int? MenuSeq { get; set; }
        public string? TitleTh { get; set; }

        // ฟิลด์ที่ใช้ในระหว่างการประมวลผลเท่านั้น
        [JsonIgnore]  // ใช้เพื่อละการ serializing field นี้
        public List<Menu> SubMenus { get; set; }  // เมนูที่เป็นลูก
        [JsonIgnore]
        public List<Menu> SubSubMenus { get; set; } // เมนูที่เป็นลูกย่อย
    }
}
