import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer-menu.html',
  styleUrl: './footer-menu.css',
})
export class FooterMenu {}
