import { Component } from '@angular/core';

@Component({
  selector: 'app-satisfaction-survey',
  templateUrl: './satisfaction-survey.component.html',
  styleUrls: ['./satisfaction-survey.component.scss']
})
export class SatisfactionSurveyComponent {

  rating: number = 0;
  hoverRating: number = 0;
  comment: string = '';
  submitted: boolean = false;

  setRating(value: number) {
    this.rating = value;
  }

  submitSurvey() {
    this.submitted = true;

    console.log({
      rating: this.rating,
      comment: this.comment
    });
  }
}