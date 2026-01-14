# 🤖 GitHub Copilot – Project Instructions

## Project-Specific Instructions for Code Generation
- Focus on **readability**, **maintainability**, and **efficiency** of code.

## Guidelines
If the prompt contains multiple tasks, prioritize them and work through them sequentially.
These tasks should be clearly structured:
1. Context (input)
2. Task (function)
3. Constraints (rules, parameters)
4. Format (output)

## General Guidelines
- **Principle:** Keep It Simple, Stupid (KISS).  
- Write **clear, understandable, and maintainable** methods.  
- **No fallback implementations** or unnecessary abstractions.  
- Each method should be **maximum 20 lines** long.  
- Use **early returns** instead of nested conditions.  
- **Avoid duplicates** – use reusable helper functions.  
- **No overengineering:** Only implement what is currently needed.  
- **Code style:** Clear naming, short comments, consistent formatting.  
- **Error handling:** Only where meaningful – no try/catch around everything.  
- **Minimize dependencies:** Only use essential libraries.
- **New features:** Always check if existing functions can be extended before creating new ones. 

## Method Guidelines
- Methods should have **one clearly defined task**.  
- Use **pure functions** where possible (no side effects).  
- **Validate input** at the beginning of each method.  
- **Define return types clearly** – no "magic behavior".  
- **No global state** or singleton logic.
- **Asynchronous programming**: Use async/await for I/O-bound operations.
- **Method reuse**: Check if existing methods can be used before creating new ones.

## Architecture Principles
- Build **small, independent modules** that can be easily tested.  
- Prefer **encapsulation** over inheritance.  
- Use **simple data structures** (lists, maps, structs).  
- **Each file** should have only **one main responsibility**.  

## Documentation
- **Short, concise comments** for complex logic.
- Do not create unnecessary md files unless instructed.

---


> 💡 **Goal:** Simple, robust, and understandable code without unnecessary complexity.
