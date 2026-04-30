import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../shared/theme/theme.service';
import { TranslatePipe } from "../../shared/i18n/translate.pipe";

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatTooltipModule, TranslatePipe],
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
}
