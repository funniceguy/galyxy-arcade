# Project Roadmap & Risks (Roadmap)

이 문서는 단순 작업 목록을 넘어, 프로젝트의 장기적인 방향성과 기술적 난제, 주의사항을 기록합니다.

## 🚧 Technical Debt & Risks (기술적 부채 및 위험)
- [ ] **Physics Determinism**: Matter.js는 부동소수점 연산으로 인해 브라우저/기기마다 미세하게 다른 물리 결과를 낼 수 있음. (경쟁 요소 도입 시 주의)
- [ ] **Garbage Collection**: 파티클이나 DOM 요소를 자주 생성/삭제하는 현재 방식은 모바일에서 GC Pausing을 유발할 수 있음. -> Object Pooling 고려 필요.
- [ ] **Canvas Resolution**: 고해상도(Retina) 디스플레이에서 캔버스가 흐릿하게 보일 수 있음. `devicePixelRatio` 대응 필요.

## 🔭 Future Roadmap (로드맵)
### Phase 7: Advanced Rendering

### Phase 8: Social & Competitive

### Phase 9: Content Expansion

