# SQL答案

1. 查詢SC表格中，學生沒有修" 01 "課程但有修" 02 "課程的情況。

``` SQL
SELECT DISTINCT SId 
FROM SC
WHERE CId = '02' 
  AND SId NOT IN (
      SELECT SId 
      FROM SC 
      WHERE CId = '01'
  );
```

2. 查詢在 SC 表格存在成績的學生資訊

``` SQL
SELECT DISTINCT Student.SId, Student.Sname, Student.Sage, Student.Ssex
FROM Student
JOIN SC ON Student.SId = SC.SId;
```

3. 查詢有成績的學生資訊

``` SQL
SELECT DISTINCT Student.SId, Student.Sname, Student.Sage, Student.Ssex
FROM Student
JOIN SC ON Student.SId = SC.SId
WHERE SC.score IS NOT NULL;
```

4. 查詢「李」姓老師的人數

``` SQL
SELECT COUNT(*) AS TeacherCount
FROM Teacher
WHERE Tname LIKE '李%';
```

5. 查詢修過「張三」老師授課的同學的資訊

``` SQL
SELECT DISTINCT Student.SId, Student.Sname, Student.Sage, Student.Ssex
FROM Student
JOIN SC ON Student.SId = SC.SId
JOIN Course ON SC.CId = Course.CId
JOIN Teacher ON Course.TId = Teacher.TId
WHERE Teacher.Tname = '張三';
```

6. 查詢至少有一門課與學號為" 01 "同學所修課程相同的同學資訊

``` SQL
SELECT DISTINCT Student.SId, Student.Sname, Student.Sage, Student.Ssex
FROM Student
JOIN SC ON Student.SId = SC.SId
WHERE SC.CId IN (SELECT CId FROM SC WHERE SId = '01') 
  AND Student.SId != '01';
```

7. 查詢兩門以上不及格課程的同學的學號，姓名及其平均成績

``` SQL
SELECT Student.SId, Student.Sname, AVG(SC.score) AS AverageScore
FROM Student
JOIN SC ON Student.SId = SC.SId
WHERE SC.score < 60
GROUP BY Student.SId, Student.Sname
HAVING COUNT(SC.CId) > 2;
```

8. 查詢" 01 "課程分數小於 60，按分數降冪排列的學生資訊

``` SQL
SELECT Student.SId, Student.Sname, Student.Sage, Student.Ssex, SC.score
FROM Student
JOIN SC ON Student.SId = SC.SId
WHERE SC.CId = '01' AND SC.score < 60
ORDER BY SC.score DESC;
```

9. 查詢每門課程選修的學生人數

``` SQL
SELECT Course.CId, Course.Cname, COUNT(DISTINCT SC.SId) AS StudentCount
FROM Course
JOIN SC ON Course.CId = SC.CId
GROUP BY Course.CId, Course.Cname;
```

10. 查詢只選修兩門課程的學生學號和姓名

``` SQL
SELECT Student.SId, Student.Sname
FROM Student
JOIN SC ON Student.SId = SC.SId
GROUP BY Student.SId, Student.Sname
HAVING COUNT(DISTINCT SC.CId) = 2;
```
