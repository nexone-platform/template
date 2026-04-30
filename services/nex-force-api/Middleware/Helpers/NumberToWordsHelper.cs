using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Helpers
{
    public static class NumberToWordsHelper
    {
        private static readonly string[] Ones = { "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen" };
        private static readonly string[] Tens = { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };
        private static readonly string[] Thousands = { "", "Thousand", "Million", "Billion" };

        public static string ConvertToWords(decimal number)
        {
            if (number == 0)
                return "Zero only";

            string words = "";

            // Convert the whole number part
            int wholeNumber = (int)number;
            if (wholeNumber > 0)
            {
                words += ConvertWholeNumberToWords(wholeNumber);
            }

            // Convert the decimal part if it exists
            decimal decimalPart = number - wholeNumber;
            if (decimalPart > 0)
            {
                words += " and " + ConvertDecimalToWords(decimalPart);
            }

            return words + " only.";
        }

        private static string ConvertWholeNumberToWords(int number)
        {
            if (number == 0) return "";

            string words = "";
            int place = 0;

            while (number > 0)
            {
                if (number % 1000 != 0)
                {
                    words = ConvertHundredsToWords(number % 1000) + " " + Thousands[place] + " " + words;
                }

                number /= 1000;
                place++;
            }

            return words.Trim();
        }

        private static string ConvertHundredsToWords(int number)
        {
            string words = "";

            if (number > 99)
            {
                words += Ones[number / 100] + " Hundred ";
                number %= 100;
            }

            if (number > 19)
            {
                words += Tens[number / 10] + " ";
                number %= 10;
            }

            if (number > 0)
            {
                words += Ones[number] + " ";
            }

            return words.Trim();
        }

        private static string ConvertDecimalToWords(decimal decimalPart)
        {
            // Get the fractional part as a whole number (two digits)
            decimalPart *= 100;
            int decimalNumber = (int)decimalPart;
            return ConvertWholeNumberToWords(decimalNumber);
        }
    }
}

