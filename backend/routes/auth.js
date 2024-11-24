router.get('/teachers', authMiddleware, teacherController.getAllTeachers);
router.post('/teachers', authMiddleware, teacherController.createTeacher);
router.put('/teachers/:teacherId', authMiddleware, teacherController.updateTeacher);
router.delete('/teachers/:teacherId', authMiddleware, teacherController.deleteTeacher);
