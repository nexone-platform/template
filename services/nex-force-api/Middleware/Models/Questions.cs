using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-questions")] 
    public class Questions
    {
        [Key]
        public int? QuestionsId { get; set; }
        public int? CategoryId { get; set; }
        public int? Position { get; set; }
        public string? Question { get; set; }
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? CorrectAns { get; set; }
        public string? CodeSnippets { get; set; }
        public string? AnsExplanation { get; set; }
        public string? VideoIink { get; set; }
        public string? ImgPath { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id

    }
    
}
