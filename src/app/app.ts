import {
  Component,
  signal,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  QueryList,
  HostListener,
} from '@angular/core';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy, AfterViewInit {
  // Event date: May 24, 2026 - "Gold Rush. The Evolution"
  protected readonly eventDate = new Date('2026-05-24T14:00:00');

  protected readonly countdown = signal<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  protected readonly isMenuOpen = signal(false);
  protected readonly scrollY = signal(0);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  @ViewChildren('animateOnScroll') animateElements!: QueryList<ElementRef>;

  private observer!: IntersectionObserver;

  ngOnInit(): void {
    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
    this.forcePlayHeroVideo();
  }

  private forcePlayHeroVideo(): void {
    // Attempt to force play the video after a short delay
    setTimeout(() => {
      const video = document.getElementById('hero-promo-video') as HTMLVideoElement;
      if (video) {
        video.muted = true; // Ensure it's muted to allow autoplay
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Hero video autoplay failed. User interaction might be required.", error);
            // Retry on first user interaction if blocked
            const retryPlay = () => {
              video.play();
              window.removeEventListener('click', retryPlay);
              window.removeEventListener('touchstart', retryPlay);
            };
            window.addEventListener('click', retryPlay);
            window.addEventListener('touchstart', retryPlay);
          });
        }
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrollY.set(window.scrollY);
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const distance = this.eventDate.getTime() - now;

    if (distance < 0) {
      this.countdown.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    this.countdown.set({
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    });
  }

  private setupScrollAnimations(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    this.animateElements.forEach((el) => {
      this.observer.observe(el.nativeElement);
    });
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  protected padNumber(n: number): string {
    return n.toString().padStart(2, '0');
  }

  protected readonly galleryImages = [
    { src: 'girl_in_event_1.jpeg', alt: 'Farmer\'s Only Event Vibes 1' },
    { src: 'girl_in_event_2.jpeg', alt: 'Farmer\'s Only Event Vibes 2' },
    { src: 'girl_in_event_3.jpeg', alt: 'Farmer\'s Only Event Vibes 3' },
    { src: 'girl_in_event_4.jpeg', alt: 'Farmer\'s Only Event Vibes 4' },
  ];

  protected readonly eventFeatures = [
    { icon: '🥩', title: 'All-Inclusive Food', desc: 'Premium BBQ, local delicacies & gourmet bites' },
    { icon: '🍹', title: 'Unlimited Drinks', desc: 'Open bar with craft cocktails & premium spirits' },
    { icon: '🎵', title: 'Live Entertainment', desc: 'Top DJs & live performances all day long' },
    { icon: '🎡', title: 'Activities & Games', desc: 'Spin & Win, giveaways, and partner prizes' },
    { icon: '🤠', title: 'Denim & Cowboy Theme', desc: 'Dress code: Denim, boots & cowboy hats!' },
    { icon: '📸', title: 'Photo Moments', desc: 'Capture memories at our premium photo booths' },
  ];
}
