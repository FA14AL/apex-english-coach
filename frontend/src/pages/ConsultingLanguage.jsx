import { useState, useRef } from 'react';
import axios from 'axios';
import AlexAvatar from '../components/AlexAvatar';
import AlexSpeech from '../components/AlexSpeech';
import VoiceRecorder from '../components/VoiceRecorder';
import ScoreCard from '../components/ScoreCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CONSULTING_PHRASES = [
  // Structuring
  { phrase: "To frame this up, there are three things to consider", category: "Structuring", when_to_use: "When you want to organise your answer before diving in", example_in_context: "A partner asks you about the client's risk profile. You say: 'To frame this up, there are three things to consider — the legacy systems, the network architecture, and their current monitoring capability.'" },
  { phrase: "If I can just take a step back for a second", category: "Structuring", when_to_use: "When you want to provide context before answering", example_in_context: "Before explaining a technical finding, say: 'If I can just take a step back for a second — the reason this matters is the way the OT network is structured.'" },
  { phrase: "Let me structure my thinking on this", category: "Structuring", when_to_use: "When asked a complex question and you need a moment to organise your answer", example_in_context: "'That's a good question — let me structure my thinking on this. There are really two dimensions to it...'" },
  { phrase: "There are a few moving parts here so let me take them in turn", category: "Structuring", when_to_use: "When the situation is complex and has multiple components", example_in_context: "'There are a few moving parts here so let me take them in turn — first the technical side, then the operational impact, then the remediation path.'" },
  { phrase: "To give you the headline first", category: "Structuring", when_to_use: "When you want to lead with the most important point", example_in_context: "'To give you the headline first — we found no evidence of active compromise, but there are three significant vulnerabilities that need addressing.'" },
  { phrase: "The way I'd break this down is", category: "Structuring", when_to_use: "When explaining a complex topic or organising an answer", example_in_context: "'The way I'd break this down is into immediate actions, medium-term improvements, and strategic changes — let me walk you through each.'" },
  { phrase: "At a high level what we're seeing is", category: "Structuring", when_to_use: "When presenting findings or giving an overview", example_in_context: "'At a high level what we're seeing is a network that's grown significantly without security being built in from the start.'" },
  { phrase: "Let me walk you through our thinking", category: "Structuring", when_to_use: "When presenting analysis or recommendations", example_in_context: "'Let me walk you through our thinking on why we've prioritised the remote access issue above the patching backlog.'" },
  // Buying thinking time
  { phrase: "That's a great question, let me think about that for a second", category: "Buying thinking time", when_to_use: "When you need a moment to formulate your answer — sounds confident, not evasive", example_in_context: "Client asks something unexpected in a meeting. Rather than fumbling, you say: 'That's a great question, let me think about that for a second.' Then answer calmly." },
  { phrase: "To make sure I understand the question correctly", category: "Buying thinking time", when_to_use: "When clarifying before answering — especially useful for complex or ambiguous questions", example_in_context: "'To make sure I understand the question correctly — are you asking about the risk level in absolute terms, or relative to industry benchmarks?'" },
  { phrase: "That's an important point, can I just check what you mean by", category: "Buying thinking time", when_to_use: "When a term or concept in the question is ambiguous", example_in_context: "'That's an important point — can I just check what you mean by 'legacy systems' in this context? Are we talking about the SCADA platform specifically, or the field devices too?'" },
  { phrase: "Good challenge — what I'd say is", category: "Buying thinking time", when_to_use: "When someone pushes back or questions your point — acknowledges the challenge before responding", example_in_context: "'Good challenge — what I'd say is that the data supports this conclusion even when you account for that variable.'" },
  { phrase: "Let me come back to that if I may", category: "Buying thinking time", when_to_use: "When you want to park a question and return to it — useful if you don't have an immediate answer", example_in_context: "'Can I let me come back to that if I may — I want to make sure I give you an accurate number rather than guessing.'" },
  { phrase: "I want to make sure I give you a proper answer on that", category: "Buying thinking time", when_to_use: "When you need time to check something before answering", example_in_context: "'I want to make sure I give you a proper answer on that — let me check the data and come back to you by end of day.'" },
  // Presenting findings
  { phrase: "What the data is telling us is", category: "Presenting findings", when_to_use: "When presenting data-led insights — grounds conclusions in evidence", example_in_context: "'What the data is telling us is that the anomalous traffic pattern occurs consistently between 2am and 4am — which suggests either a scheduled process or an attacker working in a different time zone.'" },
  { phrase: "The headline here is", category: "Presenting findings", when_to_use: "When you want to lead with the most important finding", example_in_context: "'The headline here is that the network is not segmented — everything from the business network to the control systems is effectively one flat network.'" },
  { phrase: "To put this in context", category: "Presenting findings", when_to_use: "When adding perspective to help the audience understand significance", example_in_context: "'To put this in context — this vulnerability class was exploited in 40% of OT incidents reported to CISA last year.'" },
  { phrase: "If you look at this through the lens of", category: "Presenting findings", when_to_use: "When reframing an issue from a specific perspective — financial, operational, regulatory", example_in_context: "'If you look at this through the lens of operational resilience, the real risk isn't data theft — it's production downtime.'" },
  { phrase: "The so-what here is", category: "Presenting findings", when_to_use: "When moving from findings to implications — 'so what does this mean?'", example_in_context: "'The so-what here is that even if an attacker gets in through the corporate network, they can reach the SCADA systems in less than four hops.'" },
  { phrase: "What this means practically is", category: "Presenting findings", when_to_use: "When translating technical findings into real-world impact", example_in_context: "'What this means practically is that if this vulnerability were exploited, the plant operator would have no visibility and no way to intervene quickly.'" },
  { phrase: "The story the numbers are telling is", category: "Presenting findings", when_to_use: "When presenting data — makes it feel like a narrative rather than a spreadsheet", example_in_context: "'The story the numbers are telling is one of significant improvement — incidents are down 30% year on year, but the severity of the remaining incidents is increasing.'" },
  { phrase: "To bring this to life with an example", category: "Presenting findings", when_to_use: "When using a concrete example to illustrate an abstract point", example_in_context: "'To bring this to life with an example — imagine a maintenance engineer connects a laptop with malware to the historian server. In the current setup, there's nothing to stop that malware reaching the PLCs.'" },
  // Handling pushback
  { phrase: "I hear you, and I think the nuance here is", category: "Handling pushback", when_to_use: "When acknowledging a concern before redirecting", example_in_context: "'I hear you, and I think the nuance here is the difference between theoretical risk and actual exploitability given your specific environment.'" },
  { phrase: "That's a fair challenge, what I'd say is", category: "Handling pushback", when_to_use: "When a client or colleague pushes back — validates their point without conceding yours", example_in_context: "'That's a fair challenge, what I'd say is that the precedent from similar assessments supports this approach even accounting for your specific constraints.'" },
  { phrase: "You're right to push on that", category: "Handling pushback", when_to_use: "When someone identifies a genuine weakness in your argument — shows intellectual honesty", example_in_context: "'You're right to push on that — we should be clearer about the confidence level on that finding. Let me qualify it.'" },
  { phrase: "I think we might be looking at this slightly differently", category: "Handling pushback", when_to_use: "When there's a disagreement — positions it as a perspective difference rather than a conflict", example_in_context: "'I think we might be looking at this slightly differently — I'm framing it as an operational risk issue, but I understand you're coming at it from a compliance angle.'" },
  { phrase: "That's a valid concern and here's how we've thought about it", category: "Handling pushback", when_to_use: "When a concern has already been anticipated and addressed in your analysis", example_in_context: "'That's a valid concern and here's how we've thought about it — we specifically designed the testing to be passive to avoid any operational disruption.'" },
  { phrase: "I'd push back slightly on that because", category: "Handling pushback", when_to_use: "When you disagree with something said — confident but polite", example_in_context: "'I'd push back slightly on that because the data we've seen from comparable environments doesn't support that assumption.'" },
  { phrase: "Can I offer a different perspective on that", category: "Handling pushback", when_to_use: "When you want to introduce a contrasting view diplomatically", example_in_context: "'Can I offer a different perspective on that — from a threat intelligence standpoint, the risk to your sector has increased significantly in the last 18 months.'" },
  // Simplifying complex concepts
  { phrase: "Think of it like", category: "Simplifying", when_to_use: "When introducing an analogy to explain something technical", example_in_context: "'Think of it like a building where the front door is locked but all the internal rooms are open — once someone gets past reception, they can go anywhere.'" },
  { phrase: "In plain English what this means is", category: "Simplifying", when_to_use: "When translating technical language for non-technical stakeholders", example_in_context: "'In plain English what this means is — your industrial equipment is connected to the internet in a way that wasn't intended and creates risk.'" },
  { phrase: "The way I'd explain this to a non-technical audience", category: "Simplifying", when_to_use: "When signalling you're about to simplify deliberately", example_in_context: "'The way I'd explain this to a non-technical audience is to think about it in terms of physical security — it's essentially like leaving a door to the factory floor unlocked.'" },
  { phrase: "The analogy I'd use here is", category: "Simplifying", when_to_use: "When using a metaphor to make something abstract concrete", example_in_context: "'The analogy I'd use here is a hospital — you wouldn't turn off a patient monitor just to apply a software update. Same principle applies to your PLCs.'" },
  { phrase: "To strip away the jargon", category: "Simplifying", when_to_use: "When simplifying deliberately after noticing confusion", example_in_context: "'To strip away the jargon — what we're saying is that the old system has a known flaw that attackers know about and there's no patch available.'" },
  { phrase: "The simple version of this is", category: "Simplifying", when_to_use: "When getting to the core message after complexity", example_in_context: "'The simple version of this is — fix the remote access, segment the network, and patch what you can. Everything else is secondary.'" },
  // Closing a point
  { phrase: "So the so-what here is", category: "Closing a point", when_to_use: "When summarising the implication of what you've just said", example_in_context: "'So the so-what here is that this isn't just a technical issue — it's a board-level risk.'" },
  { phrase: "Bottom line", category: "Closing a point", when_to_use: "When delivering the final, most important conclusion", example_in_context: "'Bottom line — if you don't address the remote access issue in the next 90 days, you're exposed to a class of attacks that has hit three comparable organisations this year.'" },
  { phrase: "What this means for us is", category: "Closing a point", when_to_use: "When drawing a conclusion relevant to the project or team", example_in_context: "'What this means for us is that we need to adjust the scope to include the vendor access systems — otherwise the assessment won't give us the full picture.'" },
  { phrase: "To bring that together", category: "Closing a point", when_to_use: "When summarising after covering multiple points", example_in_context: "'To bring that together — the three findings are linked. Fix the segmentation and you address two of the three issues simultaneously.'" },
  { phrase: "The key takeaway is", category: "Closing a point", when_to_use: "When identifying the single most important point for the audience to remember", example_in_context: "'The key takeaway is that operational resilience, not data protection, should be the board's primary concern in the OT context.'" },
  { phrase: "If I had to distil this to one thing", category: "Closing a point", when_to_use: "When simplifying to the absolute core message", example_in_context: "'If I had to distil this to one thing — the client's biggest risk is from their own maintenance engineers, not from sophisticated external attackers.'" },
  // Agreeing professionally
  { phrase: "Absolutely, and I'd add to that", category: "Agreeing professionally", when_to_use: "When agreeing and building on what someone has said", example_in_context: "'Absolutely, and I'd add to that the regulatory angle — the NIS2 directive specifically calls this out as a board responsibility.'" },
  { phrase: "That resonates, and what I'd build on is", category: "Agreeing professionally", when_to_use: "When validating a point and extending it", example_in_context: "'That resonates, and what I'd build on is the fact that this isn't just a technical solution — change management is at least 40% of the work.'" },
  { phrase: "Spot on, and the implication of that is", category: "Agreeing professionally", when_to_use: "When strongly agreeing and drawing out implications", example_in_context: "'Spot on, and the implication of that is we need to bring the operations team into this conversation much earlier than originally planned.'" },
  { phrase: "Completely agree, and it also means", category: "Agreeing professionally", when_to_use: "When agreeing and highlighting a consequence", example_in_context: "'Completely agree, and it also means that the phased approach we discussed is the only realistic option given the operational constraints.'" },
  { phrase: "Yes, and the other dimension to consider", category: "Agreeing professionally", when_to_use: "When agreeing and adding a new angle", example_in_context: "'Yes, and the other dimension to consider is the supply chain — the vendor who provides the SCADA updates has access that we haven't assessed yet.'" },
  // Disagreeing professionally
  { phrase: "I see it slightly differently", category: "Disagreeing professionally", when_to_use: "When expressing a different view diplomatically", example_in_context: "'I see it slightly differently — I think the risk here is actually in the convergence point rather than in either system individually.'" },
  { phrase: "I'd want to sense-check that assumption", category: "Disagreeing professionally", when_to_use: "When challenging a premise without being confrontational", example_in_context: "'I'd want to sense-check that assumption — the data I've seen suggests the attack surface has increased, not decreased, over the last two years.'" },
  { phrase: "I think there might be a gap between", category: "Disagreeing professionally", when_to_use: "When identifying a disconnect between two things", example_in_context: "'I think there might be a gap between what the documentation says and what's actually deployed on site — we saw this several times during the walk-through.'" },
  { phrase: "With respect, I think the data suggests otherwise", category: "Disagreeing professionally", when_to_use: "When confidently disagreeing based on evidence — respectful but clear", example_in_context: "'With respect, I think the data suggests otherwise — the traffic logs show lateral movement that wasn't present in the previous assessment.'" },
  { phrase: "I'd want to stress-test that view a bit", category: "Disagreeing professionally", when_to_use: "When challenging an opinion or conclusion diplomatically", example_in_context: "'I'd want to stress-test that view a bit — if we assume the air gap is intact, how do we explain the traffic pattern we're seeing on the historian?'" },
];

const OT_TERMS = [
  { term: "SCADA", pronounce: "SKAY-dah", plain_english: "Software that monitors and controls industrial equipment like pipelines, power grids, and water treatment plants from a central location.", kpmg_context: "You'll encounter SCADA systems when reviewing any client with industrial operations — energy, utilities, manufacturing, transport.", example_sentence: "The client's SCADA system hasn't been patched in three years, which creates a significant vulnerability to known exploits." },
  { term: "ICS", pronounce: "I-C-S (say each letter)", plain_english: "Industrial Control Systems — the umbrella term for all hardware and software that runs factories, infrastructure, and industrial processes.", kpmg_context: "ICS is the broad category; SCADA is one type of ICS. You'll use this term constantly in OT assessments.", example_sentence: "Our assessment covers the full ICS environment including the control room, historian servers, and field devices." },
  { term: "MITRE ATT&CK for ICS", pronounce: "MY-ter attack for I-C-S", plain_english: "A publicly available knowledge base of tactics and techniques that attackers use specifically against industrial control systems.", kpmg_context: "KPMG references this framework when mapping client vulnerabilities to known attacker behaviour — it gives assessments credibility.", example_sentence: "We've mapped the client's exposure against MITRE ATT&CK for ICS and found three high-priority gaps in their detection capability." },
  { term: "OT/IT Convergence", pronounce: "O-T versus I-T convergence", plain_english: "The increasing connection between operational technology (the systems that run physical processes) and business IT networks (emails, databases, etc.) — creating new attack paths.", kpmg_context: "This is the core risk that KPMG OT Synapse addresses. Every client conversation eventually touches on this.", example_sentence: "OT/IT convergence has dramatically expanded the attack surface over the last decade, particularly since COVID accelerated remote access adoption." },
  { term: "Air-gapped Network", pronounce: "AIR-gapt net-work", plain_english: "A network physically isolated from the internet and other external networks — historically how OT systems were kept secure. Now increasingly rare.", kpmg_context: "Clients often claim their systems are air-gapped. Part of your job is verifying whether that's actually true.", example_sentence: "The assumption that this network is air-gapped no longer holds given the remote access requirements added during COVID — we found four external connections that weren't documented." },
  { term: "Network Segmentation", pronounce: "net-work seg-men-TAY-shun", plain_english: "Dividing a network into separate zones so that if an attacker gets into one zone, they can't automatically access everything else.", kpmg_context: "Network segmentation is the most common recommendation in OT assessments. You'll be explaining this to clients constantly.", example_sentence: "We're recommending segmentation between the corporate network and the process control zone as the highest-priority action — it limits blast radius significantly." },
  { term: "IEC 62443", pronounce: "I-E-C six-two-four-four-three", plain_english: "The international standard for OT/ICS cybersecurity — sets out requirements for secure design, operations, and maintenance of industrial systems.", kpmg_context: "IEC 62443 is the benchmark KPMG uses to assess clients. Knowing the key levels (1-4) will make you credible in assessments.", example_sentence: "The client's current controls fall short of IEC 62443 Level 2 requirements in several areas, particularly around access control and patch management." },
  { term: "Purdue Model", pronounce: "PER-due model", plain_english: "A reference architecture that organises OT systems into five layers — from physical equipment at Level 0 up to business systems at Level 4 — helping define where security boundaries should sit.", kpmg_context: "You'll use the Purdue Model to describe where vulnerabilities sit and which security zones are affected.", example_sentence: "Using the Purdue Model as our reference, the main vulnerabilities sit at Level 2 where the SCADA servers are inadequately separated from the corporate network." },
  { term: "PLC", pronounce: "P-L-C (say each letter)", plain_english: "Programmable Logic Controller — a small, ruggedised computer that directly controls physical equipment like pumps, valves, and motors based on programmed logic.", kpmg_context: "PLCs are the devices that actually make things happen in OT environments. Old, unpatched PLCs are one of the most common findings.", example_sentence: "Several PLCs on site are running firmware from 2009 with no available update path — the vendor no longer supports them." },
  { term: "HMI", pronounce: "H-M-I (say each letter)", plain_english: "Human Machine Interface — the screen and control panel that operators use to monitor and control the plant. Think of it as the dashboard for industrial equipment.", kpmg_context: "HMI workstations are often running old operating systems because they're difficult to patch — a common and serious finding.", example_sentence: "The HMI workstations are running Windows XP in two locations, which is no longer supported by Microsoft and creates significant exposure." },
  { term: "Historian Server", pronounce: "his-TOR-ee-an SER-ver", plain_english: "A server that continuously logs all operational data from the OT environment over time — used for reporting, troubleshooting, and increasingly, for AI-based analysis.", kpmg_context: "The historian often bridges the OT and IT networks, making it a key vulnerability point and also a source of data for anomaly detection.", example_sentence: "The historian server sits on the corporate network without adequate controls, creating an unnecessary bridge to the OT environment that an attacker could exploit." },
  { term: "DMZ in OT Context", pronounce: "D-M-Z — de-militarised zone", plain_english: "A buffer zone between OT and IT networks that controls and monitors what data can cross between them — acts as a secure airlock.", kpmg_context: "An OT DMZ is one of the most common recommendations KPMG makes. It limits the impact of IT-side breaches on OT systems.", example_sentence: "We're proposing an OT DMZ to act as a controlled crossing point between the process network and the business network — data can be pulled safely without direct connectivity." },
  { term: "Zero Trust in OT", pronounce: "ZEE-ro trust in O-T", plain_english: "A security model where no device, user, or system is trusted by default — everything must be verified before being granted access. Harder to apply in OT due to legacy equipment.", kpmg_context: "Zero trust is a current trend in OT security. Clients ask about it. Your job is to explain why it's more complex in OT than in IT.", example_sentence: "Applying zero trust principles to OT requires a phased approach — you simply can't apply it to a PLC that was designed in 2005 without significant operational changes." },
  { term: "Anomaly Detection", pronounce: "ah-NOM-uh-lee dee-TEK-shun", plain_english: "Using AI and machine learning to monitor normal behaviour on a network, then flagging unusual activity that might indicate an attack or malfunction.", kpmg_context: "This is directly connected to Faisal's AI background. OT anomaly detection is a growing area where ML skills are genuinely valued.", example_sentence: "Our anomaly detection model flagged unusual traffic patterns on the process network at 3am — it turned out to be lateral movement from a compromised vendor laptop." },
  { term: "Asset Inventory", pronounce: "AS-set in-VEN-tor-ee", plain_english: "A complete, up-to-date list of every device on the OT network — hardware, software versions, firmware, and connectivity. The foundation of any security programme.", kpmg_context: "Asset inventory is usually the first deliverable in an OT engagement. 'You can't protect what you can't see' is a phrase you'll use constantly.", example_sentence: "The first step is always a comprehensive asset inventory — the client thought they had 200 devices on their OT network. We found 347." },
  { term: "Patch Management in OT", pronounce: "patch MAN-ij-ment in O-T", plain_english: "The process of applying security updates to OT systems — much harder than in IT because systems often can't be taken offline, and vendors may not support updates.", kpmg_context: "Patch management is one of the biggest challenges in OT. You'll need to explain why it's different from patching a laptop.", example_sentence: "Patching in OT is constrained by the fact that many systems run 24/7, vendors won't support patched versions, and a reboot can affect production for hours." },
  { term: "Legacy System Risk", pronounce: "LEG-uh-see SIS-tem risk", plain_english: "The security risk that comes from old systems — typically end-of-life software or hardware that no longer receives security updates but can't be replaced easily.", kpmg_context: "Almost every OT client has legacy system risk. Understanding the commercial and operational constraints around replacement is important.", example_sentence: "A significant portion of the risk profile comes from legacy systems that are end-of-life but can't be replaced without a multi-year capital programme costing tens of millions." },
  { term: "Threat Hunting", pronounce: "THRET hun-ting", plain_english: "Proactively searching through a network to find attackers who may already be inside — rather than waiting for alerts to fire. A more advanced security capability.", kpmg_context: "KPMG offers threat hunting as a service. You may assist on these engagements or present findings from one.", example_sentence: "We conducted a two-week threat hunt across the OT environment and found no evidence of active compromise — but we did find three persistence mechanisms from a previous incident that hadn't been cleaned up." },
  { term: "Incident Response in OT", pronounce: "IN-suh-dent reh-SPONS in O-T", plain_english: "The process of responding to and recovering from a cyberattack on industrial systems — fundamentally different from IT because you can't just shut systems down without physical consequences.", kpmg_context: "OT incident response is a specialist area. The key message is that the operational team must be involved — security decisions have physical consequences.", example_sentence: "OT incident response requires close coordination with the operations team — taking a system offline has real-world consequences that IT-trained responders sometimes don't anticipate." },
  { term: "Digital Twin", pronounce: "DIJ-uh-tul twin", plain_english: "A virtual replica of a physical OT system, used for testing, training, and modelling changes without risk to the live system.", kpmg_context: "Digital twins are increasingly used in OT assessments to test security changes safely. They're also relevant to Faisal's AI background.", example_sentence: "We used a digital twin of the client's control system to test the proposed segmentation changes before implementing them on the live network — zero operational risk." },
  { term: "Supply Chain Risk in OT", pronounce: "suh-PLY chayn risk in O-T", plain_english: "Security risk that comes from third-party vendors, contractors, and component suppliers who have access to or provide components for OT systems.", kpmg_context: "Supply chain attacks on OT are increasing. Vendor remote access is one of the top attack vectors globally.", example_sentence: "The attack vector in this case was a third-party remote access tool used by the vendor for maintenance — supply chain risk is consistently underestimated in OT environments." },
  { term: "Remote Access in OT", pronounce: "reh-MOTE AK-ses in O-T", plain_english: "The ability for vendors and engineers to access OT systems remotely — expanded massively during COVID and is now the number one attack vector in OT incidents globally.", kpmg_context: "Almost every OT assessment includes findings about remote access. KPMG has specific frameworks for securing vendor remote access.", example_sentence: "Remote access is now the most exploited attack vector in OT incidents globally — yet most of the remote access we find during assessments is unmonitored and insufficiently controlled." },
  { term: "Vulnerability Assessment", pronounce: "vul-neh-ruh-BIL-uh-tee uh-SES-ment", plain_english: "Systematically finding and documenting weaknesses in OT systems — typically done passively in OT to avoid disrupting live operations.", kpmg_context: "Vulnerability assessments are a core KPMG OT Synapse service. The key OT distinction is passive vs active scanning.", example_sentence: "We completed a passive vulnerability assessment to avoid disrupting live operations — active scanning in OT environments can cause crashes or unexpected behaviour." },
  { term: "Penetration Testing in OT", pronounce: "pen-eh-TRAY-shun TES-ting in O-T", plain_english: "Testing whether OT systems can be compromised by simulating a real attack — done very carefully in OT because active exploitation can cause physical damage or production loss.", kpmg_context: "OT pen testing is fundamentally different from IT pen testing. Managing client expectations about scope and risk is a key skill.", example_sentence: "OT penetration testing requires a completely different approach to IT pen testing — active exploitation is rarely appropriate given the operational risk, so we focus on safe proof-of-concept demonstrations." },
  { term: "Critical National Infrastructure (CNI)", pronounce: "KRIT-uh-kul NAY-shun-ul IN-fruh-struk-cher", plain_english: "Power grids, water systems, transport networks, and other systems so essential to society that their disruption would have a major national impact.", kpmg_context: "Many KPMG OT Synapse clients are CNI operators with specific legal obligations around security and incident reporting.", example_sentence: "This client falls under CNI regulations, which means mandatory reporting requirements apply in the event of a significant incident — this shapes our incident response planning." },
  { term: "Defence in Depth", pronounce: "deh-FENS in depth", plain_english: "A security strategy that uses multiple layers of controls — so if one layer fails, others still protect the system. No single control is relied upon.", kpmg_context: "Defence in depth is KPMG's recommended approach for OT security. Use this term when explaining why a single fix isn't sufficient.", example_sentence: "Our recommendations follow a defence in depth approach — no single control is sufficient on its own, which is why we're recommending seven complementary measures rather than one." },
  { term: "Operational Resilience", pronounce: "op-uh-RAY-shun-ul reh-ZIL-ee-ens", plain_english: "The ability of an organisation to continue operating and recover quickly during and after a cyberattack or other disruptive event.", kpmg_context: "Operational resilience is often the client's primary concern — they can tolerate some risks but cannot afford production downtime.", example_sentence: "The board's priority is operational resilience — they're less concerned about data loss than about maintaining production continuity, and our recommendations reflect that." },
  { term: "Threat Intelligence", pronounce: "THRET in-TEL-uh-jens", plain_english: "Curated information about current and emerging threats — who is attacking, how they're doing it, and who they're targeting. Helps organisations prepare for likely attacks.", kpmg_context: "KPMG subscribes to threat intelligence feeds and uses them to contextualise findings for clients — especially useful for board presentations.", example_sentence: "Current threat intelligence indicates this sector has seen a 60% increase in targeted ransomware over the last 18 months — three competitors have experienced incidents in that period." },
  { term: "Red Team Exercise", pronounce: "red teem EK-sur-size", plain_english: "A simulated attack by security professionals who try to compromise the organisation using real attacker techniques — tests whether defences actually work in practice.", kpmg_context: "Red team exercises are a premium KPMG offering. They follow assessment and remediation work once basic controls are in place.", example_sentence: "We're proposing a red team exercise focused specifically on the OT environment once the initial remediation work is complete — it will validate whether the controls are working as intended." },
  { term: "OT Security Maturity Model", pronounce: "O-T suh-KYOOR-uh-tee muh-CHYOOR-uh-tee MOD-ul", plain_english: "A framework that measures how developed an organisation's OT security programme is, from Level 1 (reactive, ad hoc) to Level 5 (optimised, continuous improvement).", kpmg_context: "KPMG uses a maturity model to benchmark clients and track improvement over time. Knowing the levels helps frame recommendations.", example_sentence: "On our maturity model, the client currently sits at Level 2 — reactive rather than proactive. The goal of this engagement is to define the roadmap to Level 3 within 18 months." },
  { term: "OT Security Assessment", pronounce: "O-T suh-KYOOR-uh-tee uh-SES-ment", plain_english: "A comprehensive review of an organisation's OT environment to identify vulnerabilities, assess risks, and recommend improvements — the core service KPMG OT Synapse provides.", kpmg_context: "This is the bread and butter of OT Synapse work. Understanding the methodology — discovery, assessment, reporting, remediation — is essential.", example_sentence: "We're about three weeks into the OT security assessment — discovery is complete and we're now working through the technical analysis before drafting the findings report." },
];

const CONSULTING_SCENARIOS = [
  { id: 1, title: "Present Data Analysis to a Sceptical Partner", prompt: "A Partner has reviewed your anomaly detection findings and says: 'I'm not sure the data actually supports that conclusion — walk me through your thinking.' Respond professionally and confidently.", context: "consulting" },
  { id: 2, title: "Explain Machine Learning to a Non-Technical Client", prompt: "The Operations Director asks: 'What exactly does your machine learning model actually do? I need to explain it to my board on Thursday.' Explain it in plain English using consulting language.", context: "consulting" },
  { id: 3, title: "Handle: 'Why Has This Taken So Long?'", prompt: "The client says: 'We're now three weeks in and we still haven't seen any output — why has this taken so long?' Respond professionally without being defensive.", context: "consulting" },
  { id: 4, title: "Summarise Meeting Outcomes and Next Steps", prompt: "You're closing a client workshop. Summarise what was discussed and agreed, and set out the next steps clearly. Use professional consulting language.", context: "consulting" },
  { id: 5, title: "Push Back on an Unrealistic Client Request", prompt: "The client says: 'We want the full assessment completed by the end of next week.' This is impossible given the scope. Push back professionally and propose a realistic alternative.", context: "consulting" },
  { id: 6, title: "Open a Client Presentation with Confidence", prompt: "You're opening a presentation to the client's senior leadership team. It's your first time presenting to them. Open with confidence, set the agenda, and establish credibility.", context: "consulting" },
  { id: 7, title: "Respond to: 'I Don't Think This AI Stuff Actually Works'", prompt: "A senior client says: 'To be honest, I'm sceptical about all this AI stuff — I've heard it before and it never delivers what it promises.' Respond with confidence and evidence.", context: "consulting" },
  { id: 8, title: "Close a Client Workshop", prompt: "The three-hour client workshop is ending. Close it professionally — summarise key decisions, confirm next steps, and leave the client feeling positive about the engagement.", context: "consulting" },
  { id: 9, title: "Escalate a Concern to Your Manager", prompt: "You've discovered that a key assumption in the project is wrong — it significantly affects the findings. Escalate this to your manager, Dr. Priya Sharma, clearly and professionally.", context: "consulting" },
  { id: 10, title: "Give a Project Status Update Under Pressure", prompt: "Your manager asks: 'Where are we on the deliverable — are we going to hit Friday?' Give an honest, structured status update even though things are slightly behind.", context: "consulting" },
];

const OT_SCENARIOS = [
  { id: 1, title: "SCADA Needs Monitoring Even If Never Attacked", prompt: "A plant engineer says: 'Our SCADA system has been running for 20 years without a single cyberattack — why do we need to monitor it now?' Explain in plain English why monitoring still matters.", context: "consulting" },
  { id: 2, title: "Present AI Anomaly Detection to Operations Director", prompt: "The Operations Director asks: 'What exactly did your AI model find, and should I be worried?' Present your anomaly detection findings professionally and in accessible language.", context: "consulting" },
  { id: 3, title: "Explain OT/IT Convergence Risks to a CFO", prompt: "The CFO asks: 'Can someone explain in plain English what OT/IT convergence actually means and why I should care?' Give a clear, concise explanation focused on business risk.", context: "consulting" },
  { id: 4, title: "Respond to: 'Our Systems Have Been Isolated for 20 Years'", prompt: "A sceptical client says: 'Our OT systems have been completely isolated from the internet for 20 years — they're absolutely fine.' Respond professionally and honestly.", context: "consulting" },
  { id: 5, title: "Why Patching Is Harder in OT Than IT", prompt: "A junior colleague asks: 'Why can't we just patch the OT systems like we patch laptops? What's so different?' Explain the OT patching challenge clearly and professionally.", context: "consulting" },
];

const ALL_CATEGORIES = ['All', ...new Set(CONSULTING_PHRASES.map((p) => p.category))];

export default function ConsultingLanguage({ userProfile, setUserProfile }) {
  const [tab, setTab] = useState('consulting');
  const [phraseCategory, setPhraseCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPhrase, setExpandedPhrase] = useState(null);
  const [expandedTerm, setExpandedTerm] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceScenario, setPracticeScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [alexText, setAlexText] = useState('');
  const [alexState, setAlexState] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const alexRef = useRef(null);

  const filteredPhrases = CONSULTING_PHRASES.filter((p) => {
    const matchCategory = phraseCategory === 'All' || p.category === phraseCategory;
    const matchSearch = !searchQuery || p.phrase.toLowerCase().includes(searchQuery.toLowerCase()) || p.when_to_use.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const speakTerm = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const gbVoice = voices.find((v) => v.lang === 'en-GB') || voices.find((v) => v.lang.startsWith('en'));
    if (gbVoice) utter.voice = gbVoice;
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  };

  const startPractice = (scenario) => {
    setPracticeScenario(scenario);
    setPracticeMode(true);
    setMessages([]);
    setAlexText('');
    setScores(null);
    setExchangeCount(0);

    const opening = `Right then, let's practise. ${scenario.prompt} Take your time and use the consulting language you've been studying.`;
    setMessages([{ role: 'assistant', content: opening }]);
    setAlexText(opening);
    setAlexState('speaking');
  };

  const handleUserResponse = async (text) => {
    if (loading) return;
    setAlexState('listening');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setExchangeCount((c) => c + 1);

    if (exchangeCount + 1 >= 3) {
      await scorePractice(newMessages);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/chat', {
        messages: newMessages,
        userProfile,
        moduleContext: `Consulting Language Practice: ${practiceScenario.title}. You are playing the role of the person in the scenario responding to Faisal's consulting language. Give one brief reaction then ask a follow-up question to continue the roleplay.`,
      });
      const reply = res.data.message;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      setAlexText(reply);
      setAlexState('speaking');
    } catch {
      setAlexText("Hmm, something went wrong there. Try again?");
      setAlexState('speaking');
    } finally {
      setLoading(false);
    }
  };

  const scorePractice = async (msgs) => {
    setLoading(true);
    try {
      const transcript = msgs.map((m) => `${m.role === 'assistant' ? 'Alex' : 'Faisal'}: ${m.content}`).join('\n');
      const res = await axios.post('/api/score', {
        transcript,
        module: 'consulting',
        scenario: practiceScenario.title,
      });
      setScores(res.data);
      setAlexState('idle');

      try {
        await axios.post('/api/session', {
          module: 'consulting',
          scenario_title: practiceScenario.title,
          scores: res.data,
          duration_seconds: 0,
        });
        const currentScores = userProfile?.module_scores || {};
        const existing = currentScores['consulting'] || 0;
        const newScore = Math.round((existing + (res.data.overall || 0)) / (existing ? 2 : 1));
        const updated = await axios.put('/api/profile', {
          sessions_completed: (userProfile?.sessions_completed || 0) + 1,
          module_scores: { ...currentScores, consulting: newScore },
          readiness_score: Math.min(100, Math.round(Object.values({ ...currentScores, consulting: newScore }).reduce((a, b) => a + b, 0) / Math.max(Object.keys({ ...currentScores, consulting: newScore }).length, 1))),
        });
        if (setUserProfile) setUserProfile(updated.data);
      } catch {}
    } catch {
      setAlexText("Couldn't score just now — but that was good practice.");
    } finally {
      setLoading(false);
    }
  };

  const endPractice = () => {
    setPracticeMode(false);
    setPracticeScenario(null);
    setMessages([]);
    setScores(null);
    setAlexState('idle');
    setAlexText('');
    setExchangeCount(0);
  };

  if (practiceMode) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={endPractice} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          <h1 className="text-xl font-bold text-gray-800">{practiceScenario.title}</h1>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <AlexAvatar state={alexState} size="lg" />
          <div className="flex-1">
            <AlexSpeech ref={alexRef} text={alexText} />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 mb-4 max-h-72 overflow-y-auto scrollbar-thin space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 text-sm max-w-xs md:max-w-md ${
                m.role === 'assistant' ? 'bg-purple-50 border border-purple-100 text-purple-900 mr-auto' : 'bg-indigo-600 text-white ml-auto'
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && <LoadingSpinner text="Alex is responding..." />}
        </div>

        {!scores && (
          <VoiceRecorder onTranscript={handleUserResponse} disabled={loading} />
        )}

        {!scores && exchangeCount >= 2 && (
          <div className="text-center mt-2">
            <button onClick={() => scorePractice(messages)} className="text-sm text-gray-400 underline hover:text-gray-600">
              Finish & Get Scored
            </button>
          </div>
        )}

        {scores && (
          <div className="space-y-4 mt-4">
            <ScoreCard scores={scores} />
            {scores.better_version && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-purple-600 mb-2">STRONGER VERSION</p>
                <p className="text-sm text-purple-900 italic">{scores.better_version}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={() => startPractice(practiceScenario)} className="bg-white border border-indigo-200 text-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-50">
                Try Again
              </button>
              <button onClick={endPractice} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700">
                Back to Library
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Consulting + OT Language</h1>
      <p className="text-gray-500 text-sm mb-4">50+ consulting phrases, 30 OT security terms, and voice practice scenarios.</p>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {[{ id: 'consulting', label: 'Consulting Language' }, { id: 'ot', label: 'OT Security Language' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'consulting' && (
        <div>
          {/* Search + filter */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search phrases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setPhraseCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  phraseCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Phrase list */}
          <div className="space-y-2 mb-6">
            {filteredPhrases.map((p, i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedPhrase(expandedPhrase === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">&ldquo;{p.phrase}&rdquo;</p>
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block">{p.category}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); speakTerm(p.phrase); }}
                      className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-400"
                      title="Hear it"
                    >
                      ▶
                    </button>
                    <span className="text-gray-300">{expandedPhrase === i ? '▲' : '▼'}</span>
                  </div>
                </button>
                {expandedPhrase === i && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 font-semibold mb-1">WHEN TO USE</p>
                      <p className="text-sm text-gray-700">{p.when_to_use}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="text-xs text-indigo-400 font-semibold mb-1">EXAMPLE IN CONTEXT</p>
                      <p className="text-sm text-indigo-900 italic">{p.example_in_context}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Voice practice */}
          <div className="border-t pt-5">
            <h2 className="font-semibold text-gray-800 mb-3">Voice Practice Scenarios</h2>
            <div className="grid gap-3">
              {CONSULTING_SCENARIOS.map((s) => (
                <div key={s.id} className="bg-white border rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">{s.title}</p>
                  <p className="text-xs text-gray-500 mb-3">{s.prompt.slice(0, 100)}...</p>
                  <button
                    onClick={() => startPractice(s)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700"
                  >
                    Practise This →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'ot' && (
        <div>
          {/* OT terms */}
          <div className="space-y-2 mb-6">
            {OT_TERMS.map((t, i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedTerm(expandedTerm === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-800">{t.term}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); speakTerm(t.term); }}
                        className="p-1 rounded hover:bg-indigo-50 text-indigo-400 text-xs"
                        title="Hear pronunciation"
                      >
                        ▶
                      </button>
                    </div>
                    <p className="text-xs text-indigo-600 mt-0.5">Pronounced: {t.pronounce}</p>
                  </div>
                  <span className="text-gray-300 ml-2">{expandedTerm === i ? '▲' : '▼'}</span>
                </button>
                {expandedTerm === i && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 font-semibold mb-1">PLAIN ENGLISH</p>
                      <p className="text-sm text-gray-700">{t.plain_english}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-xs text-amber-600 font-semibold mb-1">AT KPMG OT SYNAPSE</p>
                      <p className="text-sm text-amber-900">{t.kpmg_context}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="text-xs text-indigo-400 font-semibold mb-1">EXAMPLE SENTENCE</p>
                      <p className="text-sm text-indigo-900 italic">&ldquo;{t.example_sentence}&rdquo;</p>
                      <button
                        onClick={() => speakTerm(t.example_sentence)}
                        className="text-xs text-indigo-500 mt-2 underline hover:text-indigo-700"
                      >
                        Hear Alex say it
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* OT voice practice */}
          <div className="border-t pt-5">
            <h2 className="font-semibold text-gray-800 mb-3">OT Voice Practice Scenarios</h2>
            <div className="grid gap-3">
              {OT_SCENARIOS.map((s) => (
                <div key={s.id} className="bg-white border rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">{s.title}</p>
                  <p className="text-xs text-gray-500 mb-3">{s.prompt.slice(0, 110)}...</p>
                  <button
                    onClick={() => startPractice(s)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700"
                  >
                    Practise This →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
