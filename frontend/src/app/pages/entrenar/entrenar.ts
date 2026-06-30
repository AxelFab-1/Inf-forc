import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { Header } from "../../shared/header/header";
import { FooterMenu } from "../../shared/footer-menu/footer-menu";

@Component({
  selector: 'app-entrenar',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, FooterMenu],
  templateUrl: './entrenar.html',
  styleUrl: './entrenar.css',
})
export class Entrenar {}
