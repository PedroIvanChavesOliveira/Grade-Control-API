import express from 'express';
import { promises as fs } from 'fs';

const router = express.Router();

// EX 1
router.post('/', async (req, res, next) => {
  try {
    let grades = req.body;
    const data = JSON.parse(await fs.readFile('./grades.json'));

    if (
      !grades.student ||
      !grades.subject ||
      !grades.type ||
      grades.value == null
    ) {
      throw new Error('Student, subject, type e value devem ser cadastrado!');
    }

    grades.timestamp = new Date();
    grades = {
      id: data.nextId++,
      student: grades.student,
      subject: grades.subject,
      type: grades.type,
      value: grades.value,
      timestamp: grades.timestamp,
    };

    data.grades.push(grades);

    await fs.writeFile('grades.json', JSON.stringify(data, null, 2));
    res.send(grades);
  } catch (error) {
    next(error);
  }
});

// EX 2
router.put('/:id', async (req, res, next) => {
  try {
    let gradeBody = req.body;
    const data = JSON.parse(await fs.readFile('grades.json'));

    const index = data.grades.findIndex((g) => g.id === gradeBody.id);
    gradeBody.timestamp = new Date();

    if (index !== -1) {
      if (
        !gradeBody.student ||
        !gradeBody.subject ||
        !gradeBody.type ||
        gradeBody.value == null
      ) {
        throw new Error('Student, subject, type e value devem ser cadastrado!');
      }

      data.grades[index].student = gradeBody.student;
      data.grades[index].subject = gradeBody.subject;
      data.grades[index].type = gradeBody.type;
      data.grades[index].value = gradeBody.value;
      await fs.writeFile('grades.json', JSON.stringify(data, null, 2));

      res.send(gradeBody);
    } else {
      throw new Error('Index Inválido');
    }
  } catch (error) {
    next(error);
  }
});

// EX 3
router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await fs.readFile('grades.json'));
    const deleteById = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );
    data.grades = deleteById;
    await fs.writeFile('grades.json', JSON.stringify(data, null, 2));
    res.end();
  } catch (error) {
    next(error);
  }
});

// EX 4
router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await fs.readFile('grades.json'));

    const gradeId = data.grades.find(
      (grade) => grade.id === parseInt(req.params.id)
    );
    res.send(gradeId);
  } catch (error) {
    next(error);
  }
});

// EX 5
router.get('/totalGrade/:student/:subject', async (req, res, next) => {
  try {
    const data = JSON.parse(await fs.readFile('grades.json'));

    const student = data.grades.filter(
      (name) => name.student === req.params.student
    );

    const subjectPerStudent = student.filter(
      (grade) => grade.subject === req.params.subject
    );

    let summary = 0;
    let notesArray = [];

    subjectPerStudent.forEach((note) => (summary += note.value));
    notesArray.push({
      student: req.params.student,
      subject: req.params.subject,
      summaryNotes: summary,
    });

    res.send(notesArray);
  } catch (error) {
    next(error);
  }
});

// EX 6
router.get('/mediaGrade/:subject/:type', async (req, res, next) => {
  try {
    const data = JSON.parse(await fs.readFile('grades.json'));

    const subject = data.grades.filter(
      (sub) => sub.subject === req.params.subject
    );

    const typePerSubject = subject.filter(
      (type) => type.type === req.params.type
    );

    let summary = 0;
    let notesArray = [];

    typePerSubject.forEach((note) => (summary += note.value));
    summary = summary / typePerSubject.length;

    notesArray.push({
      subject: req.params.subject,
      type: req.params.type,
      mediaNotes: summary,
    });

    res.send(notesArray);
  } catch (error) {
    next(error);
  }
});

//EX 7
router.get('/top3BestGrade/:subject/:type', async (req, res, next) => {
  try {
    const data = JSON.parse(await fs.readFile('grades.json'));

    const subject = data.grades.filter(
      (sub) => sub.subject === req.params.subject
    );

    const typePerSubject = subject.filter(
      (type) => type.type === req.params.type
    );

    let notesArray = [];
    let arrayTotal = [];

    typePerSubject.sort((a, b) => {
      return b.value - a.value;
    });
    arrayTotal = [...typePerSubject];

    notesArray.push({
      subject: req.params.subject,
      type: req.params.type,
      top1: arrayTotal[0].id,
      top2: arrayTotal[1].id,
      top3: arrayTotal[2].id,
    });

    res.send(notesArray);
  } catch (error) {
    next(error);
  }
});

router.use((err, req, res, next) => {
  global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;
