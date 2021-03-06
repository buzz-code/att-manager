import Lesson from '../models/lesson.model';
import genericController from '../../common-modules/server/controllers/generic.controller';

export const { findAll, findById, store, update, destroy, uploadMultiple } = genericController(Lesson);