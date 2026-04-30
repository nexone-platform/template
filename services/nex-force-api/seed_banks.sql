INSERT INTO public."Banks" ("BankId", "BankCode", "BankNameEn", "BankNameTh") VALUES
(1, 'BBL', 'Bangkok Bank', 'ธนาคารกรุงเทพ'),
(2, 'KBANK', 'Kasikornbank', 'ธนาคารกสิกรไทย'),
(3, 'SCB', 'Siam Commercial Bank', 'ธนาคารไทยพาณิชย์'),
(4, 'KTB', 'Krung Thai Bank', 'ธนาคารกรุงไทย'),
(5, 'TTB', 'TMBThanachart Bank', 'ธนาคารทหารไทยธนชาต'),
(6, 'BAY', 'Bank of Ayudhya', 'ธนาคารกรุงศรีอยุธยา'),
(7, 'GSB', 'Government Savings Bank', 'ธนาคารออมสิน'),
(8, 'UOB', 'United Overseas Bank (Thai)', 'ธนาคารยูโอบี'),
(9, 'CIMB', 'CIMB Thai Bank', 'ธนาคารซีไอเอ็มบีไทย'),
(10, 'TISCO', 'Tisco Bank', 'ธนาคารทิสโก้'),
(11, 'ICBC', 'Industrial and Commercial Bank of China (Thai)', 'ธนาคารไอซีบีซี (ไทย)')
ON CONFLICT ("BankId") DO UPDATE 
SET "BankCode" = EXCLUDED."BankCode",
    "BankNameEn" = EXCLUDED."BankNameEn",
    "BankNameTh" = EXCLUDED."BankNameTh";
