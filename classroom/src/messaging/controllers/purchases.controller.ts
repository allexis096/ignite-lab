import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CoursesService } from 'src/services/courses.service';
import { EnrollmentsService } from 'src/services/enrollments.service';
import { StudentsService } from 'src/services/students.service';

type PurchaseCreatedPayload = {
  customer: {
    authUserId: string;
  };
  product: {
    id: string;
    title: string;
    slug: string;
  };
};

@Controller()
export class PurchasesController {
  constructor(
    private studentsService: StudentsService,
    private coursesService: CoursesService,
    private enrollmentsService: EnrollmentsService,
  ) {}

  @EventPattern('purchases.new-purchase')
  async purchasesCreated(@Payload('value') payload: PurchaseCreatedPayload) {
    let student = await this.studentsService.getStudentByAuthUserId(
      payload.customer.authUserId,
    );
    if (!student) {
      student = await this.studentsService.create({
        authUserId: payload.customer.authUserId,
      });
    }

    let course = await this.coursesService.getCourseBySlug(
      payload.product.slug,
    );
    if (!course) {
      course = await this.coursesService.createCourse({
        title: payload.product.title,
        slug: payload.product.slug,
      });
    }

    await this.enrollmentsService.createEnrollment({
      courseId: course.id,
      studentId: student.id,
    });
  }
}
